import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("🔔 WEBHOOK RECEIVED");
  console.log("========================================");
  
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Signature verified");
    console.log("📌 Event type:", event.type);
  } catch (error: any) {
    console.error("❌ Signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("💳 CHECKOUT SESSION COMPLETED");
      console.log("   Session ID:", session.id);
      console.log("   Customer:", session.customer);
      console.log("   Metadata:", JSON.stringify(session.metadata));
      
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || "pro_monthly";

      if (!userId) {
        console.error("❌ No user_id in metadata!");
        console.log("   Full metadata:", session.metadata);
        return NextResponse.json({ error: "No user_id" }, { status: 400 });
      }

      console.log("👤 User ID:", userId);
      console.log("📦 Plan:", plan);

      // Calculate subscription end
      const endDate = new Date();
      if (plan === "pro_bundle") {
        endDate.setMonth(endDate.getMonth() + 6);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      console.log("📅 Subscription end:", endDate.toISOString());

      // Update user to Pro
      const updateData = {
        is_pro: true,
        subscription_plan: plan,
        subscription_status: "active",
        subscription_end: endDate.toISOString(),
        stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Update data:", JSON.stringify(updateData));

      const { data, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("❌ Supabase UPDATE error:", error);
        
        // Try upsert as fallback
        console.log("🔄 Trying upsert...");
        const { data: upsertData, error: upsertError } = await supabase
          .from("user_profiles")
          .upsert({
            user_id: userId,
            ...updateData,
          }, { onConflict: "user_id" })
          .select();

        if (upsertError) {
          console.error("❌ Supabase UPSERT error:", upsertError);
        } else {
          console.log("✅ UPSERT successful:", upsertData);
        }
      } else {
        console.log("✅ UPDATE successful:", data);
      }

      // Verify the update worked
      const { data: verify } = await supabase
        .from("user_profiles")
        .select("is_pro, subscription_status")
        .eq("user_id", userId)
        .single();

      console.log("🔍 Verification:", verify);
      console.log("========================================");
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("📝 Subscription updated:", subscription.id);
      console.log("   Status:", subscription.status);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("❌ Subscription deleted:", subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}