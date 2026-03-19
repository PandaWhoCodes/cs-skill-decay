import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { score, level, breakdown } = body;

    if (
      typeof score !== "number" ||
      typeof level !== "string" ||
      !Array.isArray(breakdown)
    ) {
      return Response.json(
        { error: "Invalid payload: expected { score: number, level: string, breakdown: array }" },
        { status: 400 }
      );
    }

    const breakdownJson = JSON.stringify(breakdown);
    const isDecayed = score > 2.5 ? 1 : 0;

    await db.batch([
      {
        sql: "INSERT INTO submissions (score, level, breakdown, created_at) VALUES (?, ?, ?, datetime('now'))",
        args: [score, level, breakdownJson],
      },
      {
        sql: "UPDATE stats SET total_assessed = total_assessed + 1, total_score = total_score + ?, decay_count = decay_count + ? WHERE id = 1",
        args: [score, isDecayed],
      },
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to submit:", error);
    return Response.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
