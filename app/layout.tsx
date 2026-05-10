import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PTE 高频题库 · 飞凡英语',
  description: 'PTE Academic SST、WE、WFD 高频题库与听写练习',
  keywords: 'PTE, SST, WFD, WE, Summarize Spoken Text, Write From Dictation, PTE备考, 英语考试',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
