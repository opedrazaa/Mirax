import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText } from "unpdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    if (filename.endsWith(".pdf")) {
      const result = await extractText(new Uint8Array(arrayBuffer));
      // Handle both string and array of strings
      const text = Array.isArray(result.text) 
        ? result.text.join("\n") 
        : (result.text || "");
      return NextResponse.json({ text });
    }

    if (filename.endsWith(".docx")) {
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result?.value || "" });
    }

    return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or DOCX." }, { status: 400 });
  } catch (e: any) {
    console.error("Extract error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}