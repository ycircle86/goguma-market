import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '고구마 마켓',
  description: '동네 이웃과 함께하는 따뜻한 중고 거래',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="min-h-screen bg-goguma-cream">{children}</body>
    </html>
  )
}
