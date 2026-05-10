import JSZip from "jszip";

export type DropboxPdfFile = {
  name: string;
  path: string;
  modifiedAt?: Date;
  data: Uint8Array;
};

const DEFAULT_DROPBOX_URL =
  "https://www.dropbox.com/sh/0x7nqk56yq804rz/AABXb6NShiIrqbwptWd_NLnka?dl=0";

export function getDropboxSharedUrl() {
  return process.env.DROPBOX_SHARED_URL || DEFAULT_DROPBOX_URL;
}

export function toDropboxZipUrl(sharedUrl: string) {
  const url = new URL(sharedUrl);

  if (url.hostname === "www.dropbox.com" || url.hostname === "dropbox.com") {
    url.hostname = "www.dropbox.com";
    url.searchParams.set("dl", "1");
    return url.toString();
  }

  return sharedUrl;
}

export async function downloadDropboxArchive(sharedUrl = getDropboxSharedUrl()) {
  const response = await fetch(toDropboxZipUrl(sharedUrl), {
    headers: {
      "User-Agent": "pte-wfd-sync/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Dropbox download failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const archive = new Uint8Array(await response.arrayBuffer());

  if (contentType.includes("text/html") || archive.byteLength < 256) {
    throw new Error("Dropbox returned a page instead of the shared folder zip.");
  }

  return archive;
}

export async function selectWfdPdfFromArchive(
  archive: Uint8Array,
  folderKeyword = process.env.WFD_FOLDER_KEYWORD || "周预测",
) {
  const zip = await JSZip.loadAsync(archive);
  const allPdfs = Object.values(zip.files).filter((file) => {
    const path = file.name.toLowerCase();
    return !file.dir && path.endsWith(".pdf") && path.includes("wfd");
  });

  if (allPdfs.length === 0) {
    throw new Error("No PDF file containing WFD was found in the Dropbox archive.");
  }

  const folderMatches = allPdfs.filter((file) =>
    file.name.toLowerCase().includes(folderKeyword.toLowerCase()),
  );
  const candidates = folderMatches.length > 0 ? folderMatches : allPdfs;

  candidates.sort((left, right) => {
    const dateDiff = right.date.getTime() - left.date.getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return right.name.localeCompare(left.name, "zh-Hans-CN", {
      numeric: true,
      sensitivity: "base",
    });
  });

  const selected = candidates[0];
  const data = await selected.async("uint8array");
  const pathParts = selected.name.split("/");

  return {
    name: pathParts[pathParts.length - 1] || selected.name,
    path: selected.name,
    modifiedAt: selected.date,
    data,
  } satisfies DropboxPdfFile;
}
