import type React from "react"
import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import "../globals.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Welcome to Talk2DHand",
  description: "Gamified LMS for Sign Language",
  icons: {
    icon: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
}

export default function StarterLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${fredoka.variable} font-sans`}>
      {children}
    </div>
  )
}