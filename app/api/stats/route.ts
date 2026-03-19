import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db.execute(
      "SELECT total_assessed, total_score, decay_count FROM stats WHERE id = 1"
    );

    const row = result.rows[0];

    if (!row || Number(row.total_assessed) === 0) {
      return Response.json({
        totalAssessed: 0,
        decayPercentage: 68,
        avgSeverity: 4.2,
      });
    }

    const totalAssessed = Number(row.total_assessed);
    const totalScore = Number(row.total_score);
    const decayCount = Number(row.decay_count);

    return Response.json({
      totalAssessed,
      decayPercentage: Math.round((decayCount / totalAssessed) * 100),
      avgSeverity: Number((totalScore / totalAssessed).toFixed(1)),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return Response.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
