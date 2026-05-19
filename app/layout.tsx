import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Grassi Tech Quest',
  description: 'Gamification del Grassi Linux Tech Day 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  )
}