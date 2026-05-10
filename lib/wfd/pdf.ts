import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { PDFParse } from "pdf-parse";

const canvasGlobals = globalThis as Record<string, unknown>;

canvasGlobals.DOMMatrix ??= DOMMatrix;
canvasGlobals.ImageData ??= ImageData;
canvasGlobals.Path2D ??= Path2D;

export async function extractPdfText(data: Uint8Array) {
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
