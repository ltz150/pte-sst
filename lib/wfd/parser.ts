import type { WfdDataset, WfdItem } from "@/lib/wfd/types";

type DraftItem = {
  english: string;
  chinese: string;
};

const CJK_PATTERN = /[\u3400-\u9fff\uf900-\ufaff]/;
const LATIN_PATTERN = /[A-Za-z]/;

const METADATA_PATTERNS = [
  /^wfd\b/i,
  /^pte\b/i,
  /^write from dictation$/i,
  /^page\s+\d+/i,
  /^\d+\s*\/\s*\d+$/,
  /^预测/,
  /^更新时间/,
  /^机经/,
];

export function parseWfdTextToDataset({
  text,
  sourceFileName,
  sourcePath,
  sourceModifiedAt,
}: {
  text: string;
  sourceFileName: string;
  sourcePath: string;
  sourceModifiedAt?: Date;
}): WfdDataset {
  const warnings: string[] = [];
  const drafts = collectDraftItems(text);
  const items = dedupeAndSort(drafts);

  if (items.length === 0) {
    warnings.push("No English WFD sentences were extracted from the PDF.");
  }

  return {
    updatedAt: new Date().toISOString(),
    sourceFileName,
    sourcePath,
    sourceModifiedAt: sourceModifiedAt?.toISOString(),
    itemCount: items.length,
    items,
    warnings,
  };
}

export function collectDraftItems(text: string) {
  const lines = text
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean)
    .filter((line) => !isMetadataLine(line));

  const drafts: DraftItem[] = [];
  let current: DraftItem | null = null;

  for (const line of lines) {
    const english = normalizeEnglish(extractEnglish(line));
    const chinese = normalizeChinese(extractChinese(line));
    const startsNewItem = startsWithIndex(line) || shouldStartNewItem(current, english);

    if (english) {
      if (!current || startsNewItem) {
        current = { english, chinese };
        drafts.push(current);
      } else if (current.english && !looksCompleteSentence(current.english)) {
        current.english = normalizeEnglish(`${current.english} ${english}`);
        if (chinese) {
          current.chinese = normalizeChinese(`${current.chinese} ${chinese}`);
        }
      } else {
        current = { english, chinese };
        drafts.push(current);
      }

      continue;
    }

    if (chinese && current) {
      current.chinese = normalizeChinese(`${current.chinese} ${chinese}`);
    }
  }

  return drafts.filter((item) => isLikelySentence(item.english));
}

function cleanLine(line: string) {
  return line
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function isMetadataLine(line: string) {
  const withoutIndex = stripLeadingIndex(line).trim();
  return METADATA_PATTERNS.some((pattern) => pattern.test(withoutIndex));
}

function startsWithIndex(line: string) {
  return (
    /^\s*\d+\s+of\s+\d+\s*[-–—]{1,2}\s*\d+[.)]?\s*/i.test(line) ||
    /^\s*(?:\d{1,4}|[A-Z])(?:[.)、]|[：:])\s*/.test(line) ||
    /^\s*(?:\d{1,4}|[A-Z])\s+/.test(line)
  );
}

function stripLeadingIndex(line: string) {
  return line
    .replace(/^\s*\d+\s+of\s+\d+\s*[-–—]{1,2}\s*\d+[.)]?\s*/i, "")
    .replace(/^\s*(?:\d{1,4}|[A-Z])(?:[.)、]|[：:])\s*/, "")
    .replace(/^\s*(?:\d{1,4}|[A-Z])\s+/, "");
}

function extractEnglish(line: string) {
  const stripped = stripLeadingIndex(line)
    .replace(/[\u3400-\u9fff\uf900-\ufaff]+/g, " ")
    .replace(/[，。！？；：“”‘’、【】《》（）]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!LATIN_PATTERN.test(stripped)) {
    return "";
  }

  return stripped;
}

function extractChinese(line: string) {
  const stripped = stripLeadingIndex(line);
  const chunks = stripped.match(/[\u3400-\u9fff\uf900-\ufaff，。！？；：“”‘’、（）《》\s]+/g);

  return chunks?.join(" ") || "";
}

function normalizeEnglish(value: string) {
  return value
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/^[.)\]-]+/, "")
    .trim();
}

function normalizeChinese(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/萤火之光点亮远方/g, "")
    .replace(/第页共页/g, "")
    .replace(
      /^(?:极高频|高频区|中频区|低频区|降频区|升频区|高频|中频|低频|重回|极限预测|预测|简单|普通|困难|重点|新题|老题)+/,
      "",
    )
    .replace(/^[，。！？；：、]+/, "")
    .trim();
}

function shouldStartNewItem(current: DraftItem | null, english: string) {
  if (!current || !english) {
    return false;
  }

  if (!current.english) {
    return false;
  }

  return looksCompleteSentence(current.english);
}

function looksCompleteSentence(value: string) {
  return /[.!?]$/.test(value.trim());
}

function isLikelySentence(value: string) {
  const words = value.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];

  if (words.length < 3) {
    return false;
  }

  if (!LATIN_PATTERN.test(value) || CJK_PATTERN.test(value)) {
    return false;
  }

  return !METADATA_PATTERNS.some((pattern) => pattern.test(value));
}

function dedupeAndSort(drafts: DraftItem[]) {
  const seen = new Map<string, WfdItem>();

  for (const draft of drafts) {
    const english = normalizeEnglish(draft.english);
    const chinese = normalizeChinese(draft.chinese);
    const key = english.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.set(key, {
      id: slugifySentence(english),
      english,
      chinese,
    });
  }

  return Array.from(seen.values()).sort((left, right) =>
    left.english.localeCompare(right.english, "en-US", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function slugifySentence(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || crypto.randomUUID();
}
