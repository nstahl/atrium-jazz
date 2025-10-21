import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { DM_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DateRangeProvider } from '@/context/DateRangeContext'
// These styles apply to every route in the application
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
})
 
export const metadata: Metadata = {
  title: 'Atrium Jazz | Live Jazz Music in NYC',
  description: 'Discover live jazz music, artists, and venues in New York City. Curated by Atrium Jazz.',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="min-h-screen flex flex-col">
          <DateRangeProvider>
            <Navbar />
            <main className="mt-20 flex-grow">
              {children}
            </main>
            <Footer />
          </DateRangeProvider>
          <Analytics />
          <SpeedInsights />
      </body>
    </html>
  )
}