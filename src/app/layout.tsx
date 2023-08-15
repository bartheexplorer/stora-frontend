import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stora.id - Next Level Online Store & Form Order',
  description: 'Dengan Stora, Anda dapat menjalankan toko online Anda dengan cepat dan mudah. Tidak perlu repot dengan proses order yang rumit, karena Stora memberikan solusi yang efisien untuk mempercepat proses order Anda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
