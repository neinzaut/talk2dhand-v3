"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/shared/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shared/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/avatar"
import { useAppStore, type Language } from "@/store/app-store"

export function AppHeader() {
  const { streak, currentLanguage, setLanguage, isStreakActive } = useAppStore()
  const [prevStreak, setPrevStreak] = useState(streak)
  const [prevStreakActive, setPrevStreakActive] = useState(isStreakActive)
  const [isAnimating, setIsAnimating] = useState(false)

  // Animate when streak updates or when streak activates for the first time
  useEffect(() => {
    if ((streak !== prevStreak && streak > prevStreak) || (!prevStreakActive && isStreakActive)) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setPrevStreak(streak)
        setPrevStreakActive(isStreakActive)
      }, 600)
      return () => clearTimeout(timer)
    }
    setPrevStreak(streak)
    setPrevStreakActive(isStreakActive)
  }, [streak, prevStreak, isStreakActive, prevStreakActive])

  const languages = [
    { code: "asl" as Language, flag: "🇺🇸", name: "American Sign Language" },
    { code: "fsl" as Language, flag: "🇵🇭", name: "Filipino Sign Language" },
  ]

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0]

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/icons/logo.png" alt="Talk2Hand" className="h-8" />
      </div>

      {/* Right section with streak, language selector, and avatar */}
      <div className="flex items-center gap-4">
        {/* Streak - Pill tag */}
        <div className="flex items-center gap-2.5 rounded-full bg-gray-100 px-4 py-1.5">
          <div
            className={`transition-all duration-300 ${
              isAnimating
                ? "scale-125 brightness-125 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]"
                : "scale-100"
            }`}
          >
            <img
              src="/icons/streak.png"
              alt="Streak"
              className={`h-5 w-5 transition-all duration-300 ${
                isAnimating ? "animate-pulse" : ""
              }`}
            />
          </div>
          <span
            className={`text-base text-gray-700 transition-all duration-300 ${
              isAnimating
                ? "scale-110 text-orange-600"
                : "scale-100"
            }`}
          >
            {streak}
          </span>
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              className="gap-2 bg-transparent"
            >
              <img 
                src={`/icons/icon-${currentLang.code}.png`} 
                alt={currentLang.name} 
                className="h-5 w-5"
              />
              <span>{currentLang.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)} className="cursor-pointer">
                <img 
                  src={`/icons/icon-${lang.code}.png`} 
                  alt={lang.name} 
                  className="h-5 w-5 mr-2"
                />
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <Avatar>
          <AvatarImage src="/icons/icon-user.png" alt="User" />
          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
