export type WfdItem = {
  id: string;
  english: string;
  chinese: string;
};

export type WfdDataset = {
  updatedAt: string;
  sourceFileName: string;
  sourcePath: string;
  sourceModifiedAt?: string;
  itemCount: number;
  items: WfdItem[];
  warnings: string[];
};

export type WfdSyncResult = {
  dataset: WfdDataset;
  stored: boolean;
  pdfBlobUrl?: string;
  jsonBlobUrl?: string;
};
