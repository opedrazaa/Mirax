import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get current month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check if user is Pro
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_pro, subscription_end")
      .eq("user_id", userId)
      .single();

    let isPro = profile?.is_pro || false;
    
    // Check if subscription expired
    if (isPro && profile?.subscription_end) {
      if (new Date(profile.subscription_end) < now) {
        isPro = false;
      }
    }

    // Get or create usage record for this month
    const { data: existingUsage } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("month_key", monthKey)
      .single();

    let currentCount = existingUsage?.analyses_count || 0;

    if (action === "check") {
      // Just checking if user can analyze
      const canAnalyze = isPro || currentCount < FREE_LIMIT;
      return NextResponse.json({
        canAnalyze,
        isPro,
        analysesUsed: currentCount,
        analysesRemaining: isPro ? null : Math.max(0, FREE_LIMIT - currentCount),
      });
    }

    if (action === "increment") {
      // Check if free user has exceeded limit
      if (!isPro && currentCount >= FREE_LIMIT) {
        return NextResponse.json({
          error: "Free limit reached",
          canAnalyze: false,
          isPro: false,
          analysesUsed: currentCount,
          analysesRemaining: 0,
        }, { status: 403 });
      }

      // Increment or create usage record
      if (existingUsage) {
        const { error } = await supabase
          .from("usage_tracking")
          .update({
            analyses_count: currentCount + 1,
            last_analysis_at: now.toISOString(),
          })
          .eq("id", existingUsage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("usage_tracking")
          .insert({
            user_id: userId,
            month_key: monthKey,
            month_start: monthStart.toISOString(),
            analyses_count: 1,
            last_analysis_at: now.toISOString(),
          });

        if (error) throw error;
      }

      currentCount += 1;

      return NextResponse.json({
        success: true,
        isPro,
        analysesUsed: currentCount,
        analysesRemaining: isPro ? null : Math.max(0, FREE_LIMIT - currentCount),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Usage tracking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track usage" },
      { status: 500 }
    );
  }
}