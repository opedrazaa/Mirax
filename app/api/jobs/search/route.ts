import { NextResponse } from "next/server";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

// Map country codes to Adzuna country codes
const COUNTRY_MAP: Record<string, string> = {
  CH: "ch",
  DE: "de",
  FR: "fr",
  AT: "at",
  NL: "nl",
  BE: "be",
  IT: "it",
  ES: "es",
  GB: "gb",
};

export async function POST(req: Request) {
  try {
    const { query, country = "CH", page = 1 } = await req.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return NextResponse.json({ error: "Adzuna API not configured" }, { status: 500 });
    }

    const countryCode = COUNTRY_MAP[country] || "ch";
    const resultsPerPage = 10;

    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(query)}&content-type=application/json`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Adzuna API error:", response.status, await response.text());
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    const data = await response.json();

    // Transform Adzuna response to our format
    const jobs = (data.results || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || "Company not listed",
      location: job.location?.display_name || "Location not specified",
      description: job.description || "",
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      salary_text: formatSalary(job.salary_min, job.salary_max, countryCode),
      url: job.redirect_url,
      created: job.created,
      contract_type: job.contract_type || null,
      category: job.category?.label || null,
    }));

    return NextResponse.json({
      success: true,
      jobs,
      total: data.count || 0,
      page,
    });

  } catch (error: any) {
    console.error("Job search error:", error);
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}

function formatSalary(min: number | null, max: number | null, country: string): string {
  const currency = country === "ch" ? "CHF" : "€";
  
  if (!min && !max) return "Salary not listed";
  
  const formatNum = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return n.toString();
  };

  if (min && max) {
    return `${currency} ${formatNum(min)} - ${formatNum(max)}`;
  } else if (min) {
    return `${currency} ${formatNum(min)}+`;
  } else if (max) {
    return `Up to ${currency} ${formatNum(max)}`;
  }
  
  return "Salary not listed";
}