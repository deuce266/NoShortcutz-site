import './globals.css'

export const metadata = {
  title: 'NoShortCutz — The Pressure-Tested Monthly',
  description: 'One brain system. One athlete. One tool. Every month.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
