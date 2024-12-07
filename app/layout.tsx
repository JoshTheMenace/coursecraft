import './globals.css'
import { Inter } from 'next/font/google'
import { BackgroundAnimation } from './BackgroundAnimation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Stunning Course Generator',
  description: 'Generate courses with a jaw-dropping UI',
}

// layout is now a server component by default
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        {/* Client-side background animation */}
        <BackgroundAnimation />
        {children}
      </body>
    </html>
  )
}
