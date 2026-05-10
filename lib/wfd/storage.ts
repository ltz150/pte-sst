import { get, put } from "@vercel/blob";

import { bootstrapWfdData } from "@/data/bootstrap-wfd";
import type { WfdDataset, WfdSyncResult } from "@/lib/wfd/types";

const LATEST_JSON_PATH = process.env.WFD_LATEST_JSON_PATH || "wfd/latest.json";

type ReadLatestWfdDataOptions = {
  allowBootstrap?: boolean;
};

const emptyWfdData: WfdDataset = {
  updatedAt: "",
  sourceFileName: "",
  sourcePath: "",
  itemCount: 0,
  items: [],
  warnings: ["No synchronized WFD data is available yet."],
};

export async function readLatestWfdData(options: ReadLatestWfdDataOptions = {}) {
  const allowBootstrap = options.allowBootstrap ?? true;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return allowBootstrap ? bootstrapWfdData : emptyWfdData;
  }

  try {
    const result = await get(LATEST_JSON_PATH, { access: "public" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return allowBootstrap ? bootstrapWfdData : emptyWfdData;
    }

    const json = await new Response(result.stream).text();
    return JSON.parse(json) as WfdDataset;
  } catch {
    return allowBootstrap ? bootstrapWfdData : emptyWfdData;
  }
}

export async function saveWfdSyncResult(
  dataset: WfdDataset,
  pdf: Uint8Array,
): Promise<WfdSyncResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to persist synchronized WFD data.");
  }

  const safeFileName = toSafePathSegment(dataset.sourceFileName || "wfd.pdf");
  const day = dataset.updatedAt.slice(0, 10);
  const pdfPath = `wfd/archive/${day}/${safeFileName}`;
  const pdfBuffer = Buffer.from(pdf);

  const [pdfBlob, jsonBlob] = await Promise.all([
    put(pdfPath, pdfBuffer, {
      access: "public",
      allowOverwrite: true,
      contentType: "application/pdf",
      multipart: pdf.byteLength > 4_000_000,
    }),
    put(LATEST_JSON_PATH, JSON.stringify(dataset, null, 2), {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
    }),
  ]);

  return {
    dataset,
    stored: true,
    pdfBlobUrl: pdfBlob.url,
    jsonBlobUrl: jsonBlob.url,
  };
}

function toSafePathSegment(value: string) {
  const cleaned = value
    .normalize("NFKC")
    .replace(/[^\w.\-\u3400-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "wfd.pdf";
}
