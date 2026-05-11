import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

type TtsRequest = {
  text?: string;
  lang?: "en-US" | "zh-CN";
  rate?: number;
};

const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const MINIMAX_SPEECH_URL = "https://api.minimax.io/v1/t2a_v2";
const DEFAULT_RATE_LIMIT_PER_HOUR = 900;
const CACHE_VERSION = "v3";
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export async function GET() {
  const provider = getTtsProvider();
  const premium = Boolean(provider) && process.env.PREMIUM_TTS_ENABLED !== "0";

  return Response.json({
    premium,
    provider,
    model: premium ? getModelName(provider) : null,
    englishVoice: premium ? getVoiceName(provider, "en-US") : null,
    chineseVoice: premium ? getVoiceName(provider, "zh-CN") : null,
    blobCache: premium && isBlobTtsCacheEnabled(),
    rateLimitPerHour: premium ? getRateLimitPerHour() : null,
  });
}

export async function POST(request: Request) {
  const provider = getTtsProvider();

  if (!provider || process.env.PREMIUM_TTS_ENABLED === "0") {
    return Response.json(
      {
        ok: false,
        error: "Premium TTS is not configured.",
      },
      { status: 200 },
    );
  }

  let payload: TtsRequest;

  try {
    payload = (await request.json()) as TtsRequest;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const text = sanitizeText(payload.text);
  const lang = payload.lang === "zh-CN" ? "zh-CN" : "en-US";
  const speed = clamp(payload.rate ?? 0.9, 0.75, 1.15);
  const speechOptions = getSpeechOptions(provider, lang, speed);

  if (!text) {
    return Response.json({ ok: false, error: "Text is required." }, { status: 400 });
  }

  if (text.length > 700) {
    return Response.json({ ok: false, error: "Text is too long." }, { status: 400 });
  }

  const cacheKey = getAudioCacheKey(text, speechOptions);
  const cachedAudio = await readCachedAudio(cacheKey);

  if (cachedAudio) {
    return audioResponse(cachedAudio, "blob-cache");
  }

  const rateLimit = checkRateLimit(request);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Premium TTS is temporarily rate limited.",
        retryAfter: Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
      },
      {
        status: 200,
        headers: rateLimitHeaders(rateLimit),
      },
    );
  }

  const result =
    provider === "minimax"
      ? await synthesizeWithMiniMax(text, speechOptions)
      : await synthesizeWithOpenAi(text, speechOptions);

  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: "Premium TTS request failed.",
        provider,
        code: result.code,
        message: result.message,
        detail: result.detail.slice(0, 500),
      },
      { status: 200 },
    );
  }

  const audio = result.audio;
  await writeCachedAudio(cacheKey, audio);

  return audioResponse(audio, provider, rateLimit);
}

type TtsProvider = "minimax" | "openai";

type SpeechOptions = ReturnType<typeof getSpeechOptions>;

type SynthesisResult =
  | {
      ok: true;
      audio: Buffer;
    }
  | {
      ok: false;
      code: string | null;
      message: string | null;
      detail: string;
    };

function getTtsProvider(): TtsProvider | null {
  if (process.env.TTS_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.MINIMAX_API_KEY) {
    return "minimax";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return null;
}

async function synthesizeWithMiniMax(text: string, options: SpeechOptions): Promise<SynthesisResult> {
  if (options.provider !== "minimax") {
    return {
      ok: false,
      code: "provider_mismatch",
      message: "MiniMax options are required.",
      detail: "",
    };
  }

  const response = await fetch(process.env.MINIMAX_TTS_URL || MINIMAX_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      text,
      stream: false,
      language_boost: options.languageBoost,
      output_format: "hex",
      voice_setting: {
        voice_id: options.voice,
        speed: options.speed,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1,
      },
    }),
  });

  const detail = await response.text();

  if (!response.ok) {
    const error = parseProviderError(detail, "minimax");

    return { ok: false, ...error, detail };
  }

  try {
    const parsed = JSON.parse(detail) as {
      base_resp?: { status_code?: number; status_msg?: string };
      data?: { audio?: string; status?: number };
    };
    const statusCode = parsed.base_resp?.status_code ?? -1;
    const audioHex = parsed.data?.audio;

    if (statusCode !== 0 || !audioHex) {
      return {
        ok: false,
        code: String(statusCode),
        message: parsed.base_resp?.status_msg || "MiniMax did not return audio.",
        detail,
      };
    }

    return { ok: true, audio: Buffer.from(audioHex, "hex") };
  } catch (error) {
    return {
      ok: false,
      code: "invalid_response",
      message: error instanceof Error ? error.message : "Invalid MiniMax response.",
      detail,
    };
  }
}

async function synthesizeWithOpenAi(text: string, options: SpeechOptions): Promise<SynthesisResult> {
  if (options.provider !== "openai") {
    return {
      ok: false,
      code: "provider_mismatch",
      message: "OpenAI options are required.",
      detail: "",
    };
  }

  const response = await fetch(OPENAI_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      voice: options.voice,
      instructions: options.instructions,
      speed: options.speed,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = parseProviderError(detail, "openai");

    return { ok: false, ...error, detail };
  }

  return { ok: true, audio: Buffer.from(await response.arrayBuffer()) };
}

function parseProviderError(detail: string, provider: TtsProvider) {
  try {
    const parsed = JSON.parse(detail) as {
      base_resp?: { status_code?: number; status_msg?: string };
      error?: { code?: string; message?: string };
      message?: string;
    };

    if (provider === "minimax") {
      return {
        code:
          parsed.base_resp?.status_code === undefined ? null : String(parsed.base_resp.status_code),
        message: parsed.base_resp?.status_msg || parsed.message || null,
      };
    }

    return { code: parsed.error?.code || null, message: parsed.error?.message || null };
  } catch {
    return { code: null, message: null };
  }
}

function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function clamp(value: unknown, min: number, max: number) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function getModelName(provider: TtsProvider | null) {
  if (provider === "minimax") {
    return process.env.MINIMAX_TTS_MODEL || "speech-2.8-hd";
  }

  if (provider === "openai") {
    return process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  }

  return null;
}

function getVoiceName(provider: TtsProvider | null, lang: "en-US" | "zh-CN") {
  if (provider === "minimax") {
    return lang === "en-US"
      ? process.env.MINIMAX_TTS_ENGLISH_VOICE || "English_expressive_narrator"
      : process.env.MINIMAX_TTS_CHINESE_VOICE || "Chinese (Mandarin)_Warm_Girl";
  }

  if (provider === "openai") {
    return lang === "en-US"
      ? process.env.OPENAI_TTS_ENGLISH_VOICE || "marin"
      : process.env.OPENAI_TTS_CHINESE_VOICE || "coral";
  }

  return null;
}

function getSpeechOptions(provider: TtsProvider, lang: "en-US" | "zh-CN", speed: number) {
  if (provider === "minimax") {
    return {
      provider,
      model: getModelName(provider) || "speech-2.8-hd",
      voice:
        getVoiceName(provider, lang) ||
        (lang === "en-US" ? "English_expressive_narrator" : "Chinese (Mandarin)_Warm_Girl"),
      languageBoost: lang === "zh-CN" ? "Chinese" : "English",
      speed,
    };
  }

  return {
    provider,
    model: getModelName(provider) || "gpt-4o-mini-tts",
    voice: getVoiceName(provider, lang) || (lang === "en-US" ? "marin" : "coral"),
    instructions:
      lang === "en-US"
        ? "Speak in clear General American English. Use a natural, warm, confident teacher voice for PTE Write From Dictation practice. Keep the pacing calm and easy to shadow, with crisp consonants, natural sentence stress, and no dramatic emotion."
        : "Speak in natural Mandarin Chinese with a calm, clear teacher voice. Keep the pacing steady, smooth, and easy to understand.",
    speed,
  };
}

function getAudioCacheKey(text: string, options: SpeechOptions) {
  return createHash("sha256")
    .update(JSON.stringify({ version: CACHE_VERSION, text, ...options }))
    .digest("hex");
}

function getAudioCachePath(cacheKey: string) {
  return `tts/${CACHE_VERSION}/${cacheKey}.mp3`;
}

function isBlobTtsCacheEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) && process.env.TTS_BLOB_CACHE !== "0";
}

async function readCachedAudio(cacheKey: string) {
  if (!isBlobTtsCacheEnabled()) {
    return null;
  }

  try {
    const { head } = await import("@vercel/blob");
    const cached = await head(getAudioCachePath(cacheKey));
    const response = await fetch(cached.url, { cache: "force-cache" });

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function writeCachedAudio(cacheKey: string, audio: Buffer) {
  if (!isBlobTtsCacheEnabled()) {
    return;
  }

  try {
    const { put } = await import("@vercel/blob");

    await put(getAudioCachePath(cacheKey), audio, {
      access: "public",
      allowOverwrite: true,
      cacheControlMaxAge: 31536000,
      contentType: "audio/mpeg",
    });
  } catch {
    // TTS should still work if Blob caching is temporarily unavailable.
  }
}

function audioResponse(
  audio: Buffer,
  source: "blob-cache" | "minimax" | "openai",
  rateLimit?: RateLimitResult,
) {
  const headers = new Headers({
    "Content-Type": "audio/mpeg",
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    "X-Content-Type-Options": "nosniff",
    "X-TTS-Source": source,
  });

  if (rateLimit) {
    for (const [key, value] of rateLimitHeaders(rateLimit)) {
      headers.set(key, value);
    }
  }

  const body = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;

  return new Response(body, { headers });
}

function checkRateLimit(request: Request): RateLimitResult {
  const limit = getRateLimitPerHour();
  const now = Date.now();
  const resetAt = now + 60 * 60 * 1000;

  if (limit <= 0) {
    return { allowed: true, limit, remaining: Number.POSITIVE_INFINITY, resetAt };
  }

  pruneExpiredBuckets(now);

  const clientId = getClientId(request);
  const existing = rateLimitBuckets.get(clientId);
  const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt };

  if (bucket.count >= limit) {
    rateLimitBuckets.set(clientId, bucket);
    return { allowed: false, limit, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  rateLimitBuckets.set(clientId, bucket);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

function getRateLimitPerHour() {
  const configuredLimit = Number(process.env.TTS_RATE_LIMIT_PER_HOUR);

  if (!Number.isFinite(configuredLimit)) {
    return DEFAULT_RATE_LIMIT_PER_HOUR;
  }

  return Math.max(0, Math.floor(configuredLimit));
}

function getClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function pruneExpiredBuckets(now: number) {
  if (rateLimitBuckets.size < 1000) {
    return;
  }

  for (const [clientId, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(clientId);
    }
  }
}

function rateLimitHeaders(rateLimit: RateLimitResult) {
  return new Headers({
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
  });
}
