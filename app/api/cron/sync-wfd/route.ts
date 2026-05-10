import { synchronizeWfdData } from "@/lib/wfd/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";

  if (secret) {
    if (authHeader !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  } else if (isProduction) {
    return new Response("CRON_SECRET is required in production.", { status: 401 });
  }

  try {
    const result = await synchronizeWfdData();

    return Response.json({
      ok: true,
      stored: result.stored,
      itemCount: result.dataset.itemCount,
      sourceFileName: result.dataset.sourceFileName,
      jsonBlobUrl: result.jsonBlobUrl,
      pdfBlobUrl: result.pdfBlobUrl,
      warnings: result.dataset.warnings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";

    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
