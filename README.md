# PTE 高频题库 · litianzeng.cn

飞凡英语 PTE 学习站，包含：

- SST 高频题库与闪卡练习
- WE 写作题库与模板练习
- WFD 每周预测听写练习、Dropbox PDF 自动同步、AI 高清朗读

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## WFD 环境变量

```env
DROPBOX_SHARED_URL="https://www.dropbox.com/sh/0x7nqk56yq804rz/AABXb6NShiIrqbwptWd_NLnka?dl=0"
WFD_FOLDER_KEYWORD="周预测"
CRON_SECRET="replace-with-a-long-random-secret"
BLOB_READ_WRITE_TOKEN="vercel-blob-read-write-token"
MINIMAX_API_KEY="sk-cp-..."
MINIMAX_TTS_MODEL="speech-2.8-hd"
MINIMAX_TTS_ENGLISH_VOICE="English_expressive_narrator"
MINIMAX_TTS_CHINESE_VOICE="Chinese (Mandarin)_Warm_Girl"
OPENAI_API_KEY="sk-..."
PREMIUM_TTS_ENABLED="1"
TTS_PROVIDER="minimax"
OPENAI_TTS_MODEL="gpt-4o-mini-tts"
OPENAI_TTS_ENGLISH_VOICE="marin"
OPENAI_TTS_CHINESE_VOICE="coral"
TTS_BLOB_CACHE="1"
TTS_RATE_LIMIT_PER_HOUR="900"
```

没有 `MINIMAX_API_KEY` 或 `OPENAI_API_KEY` 时，WFD 会自动使用浏览器系统语音。`MINIMAX_API_KEY` 存在时会优先使用 MiniMax TTS；如需强制使用 OpenAI，可设置 `TTS_PROVIDER="openai"`。没有 `BLOB_READ_WRITE_TOKEN` 时，页面会先使用内置 fallback 数据，`/api/wfd` 仍可尝试实时解析 Dropbox，但 cron 结果不会持久化。

## Vercel Cron

`vercel.json` 中的计划任务：

```json
{
  "path": "/api/cron/sync-wfd",
  "schedule": "0 15 * * 3"
}
```

即每周三 23:00（Asia/Shanghai）同步 WFD PDF。

## 部署

```bash
npx vercel@latest --prod --yes
```

生产环境需要在 Vercel 项目里配置上面的环境变量。绑定自定义域名后，SST、WE、WFD 将在同一个站点中访问：

- `/`
- `/we`
- `/wfd`
