import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NoShortCutz — The Pressure-Tested Monthly',
  description: 'One brain system. One athlete. One tool. Every month.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
