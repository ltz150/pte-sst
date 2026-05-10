import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { CanvasFactory, getPath as getPdfWorkerPath } from "pdf-parse/worker";

const canvasGlobals = globalThis as Record<string, unknown>;

canvasGlobals.DOMMatrix ??= DOMMatrix;
canvasGlobals.ImageData ??= ImageData;
canvasGlobals.Path2D ??= Path2D;

let pdfRuntime: Promise<typeof import("pdf-parse").PDFParse> | null = null;

async function loadPdfRuntime() {
  pdfRuntime ??= import("pdf-parse").then(({ PDFParse }) => {
    PDFParse.setWorker(getPdfWorkerPath());
    return PDFParse;
  });

  return pdfRuntime;
}

export async function extractPdfText(data: Uint8Array) {
  const PDFParse = await loadPdfRuntime();
  const parser = new PDFParse({
    CanvasFactory,
    data: new Uint8Array(data),
    isImageDecoderSupported: false,
    isOffscreenCanvasSupported: false,
    useWorkerFetch: false,
  });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
