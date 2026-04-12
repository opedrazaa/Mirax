import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_pro, subscription_status, subscription_end, subscription_plan")
      .eq("user_id", userId)
      .single();

    // Get usage for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: usage, error: usageError } = await supabase
      .from("usage_tracking")
      .select("analyses_count")
      .eq("user_id", userId)
      .gte("month_start", monthStart)
      .lte("month_start", monthEnd)
      .single();

    // Check if subscription is still valid
    let isPro = profile?.is_pro || false;
    if (isPro && profile?.subscription_end) {
      const endDate = new Date(profile.subscription_end);
      if (endDate < now) {
        isPro = false;
        // Update the profile
        await supabase
          .from("user_profiles")
          .update({ is_pro: false, subscription_status: "expired" })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json({
      isPro,
      subscriptionStatus: profile?.subscription_status || "none",
      subscriptionEnd: profile?.subscription_end || null,
      subscriptionPlan: profile?.subscription_plan || null,
      analysesUsed: usage?.analyses_count || 0,
      analysesLimit: isPro ? null : 3, // null = unlimited
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get status" },
      { status: 500 }
    );
  }
}