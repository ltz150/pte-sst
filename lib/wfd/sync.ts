import {
  downloadDropboxArchive,
  getDropboxSharedUrl,
  selectWfdPdfFromArchive,
} from "@/lib/wfd/dropbox";
import { extractPdfText } from "@/lib/wfd/pdf";
import { parseWfdTextToDataset } from "@/lib/wfd/parser";
import { saveWfdSyncResult } from "@/lib/wfd/storage";

export async function buildWfdDataset() {
  const archive = await downloadDropboxArchive(getDropboxSharedUrl());
  const pdf = await selectWfdPdfFromArchive(archive);
  const text = await extractPdfText(pdf.data);
  const dataset = parseWfdTextToDataset({
    text,
    sourceFileName: pdf.name,
    sourcePath: pdf.path,
    sourceModifiedAt: pdf.modifiedAt,
  });

  return { dataset, pdf };
}

export async function synchronizeWfdData() {
  const { dataset, pdf } = await buildWfdDataset();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      dataset,
      stored: false,
    };
  }

  return saveWfdSyncResult(dataset, pdf.data);
}
