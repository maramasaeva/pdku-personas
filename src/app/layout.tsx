import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import BlobBackground from '@/components/BlobBackground'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'pdku:personas // which fellow are you?',
  description: 'Take the personality quiz and find your plzdontkillus match. 7 axes, 50 questions, one truth.',
  openGraph: {
    title: 'pdku:personas // which fellow are you?',
    description: 'Take the personality quiz and find your plzdontkillus match.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pdku:personas',
    description: 'Which PDKU fellow are you? Take the quiz.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <BlobBackground />
        <Nav />
        <main className="relative z-[2] flex-1 pt-14">
          <div className="page-container">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}
