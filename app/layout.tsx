import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PTE SST 高频题库 · 飞凡英语',
  description: 'PTE Academic Summarize Spoken Text 2026年高频简化版，61道核心题目闪卡练习',
  keywords: 'PTE, SST, Summarize Spoken Text, PTE备考, 英语考试',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
