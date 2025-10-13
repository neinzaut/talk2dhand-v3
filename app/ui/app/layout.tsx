import type React from "react"
import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Talk2DHand",
  description: "Gamified LMS for Sign Language",
  icons: {
    icon: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} font-sans`}>
        <div className="min-h-screen bg-background" style={{ backgroundImage: 'url(/icons/bgpattern.png)', backgroundRepeat: 'repeat' }}>
          <AppSidebar />
          <AppHeader />
          <main className="ml-60 pt-16">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
