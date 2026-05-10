import { readLatestWfdData } from "@/lib/wfd/storage";
import { buildWfdDataset } from "@/lib/wfd/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const dataset = await readLatestWfdData({ allowBootstrap: false });

  if (dataset.itemCount > 0) {
    return Response.json(dataset, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  const fallbackDataset = await readLatestWfdData();

  if (process.env.WFD_LIVE_FALLBACK === "0") {
    return Response.json(fallbackDataset, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    const live = await buildWfdDataset();

    return Response.json(
      {
        ...live.dataset,
        warnings: [
          ...live.dataset.warnings,
          "Served from live Dropbox fallback because Blob storage is not populated.",
        ],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown live sync error";

    return Response.json(
      {
        ...fallbackDataset,
        warnings: [...fallbackDataset.warnings, message],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  }
}
