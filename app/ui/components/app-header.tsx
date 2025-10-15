"use client"

import { Flame, ChevronDown } from "lucide-react"
import { Button } from "@/components/shared/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shared/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/avatar"
import { useAppStore, type Language } from "@/store/app-store"

export function AppHeader() {
  const { streak, currentLanguage, setLanguage, isQuizActive } = useAppStore()

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
        {/* Streak */}
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-lg font-bold">{streak}</span>
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isQuizActive}>
            <Button 
              variant="default" 
              className={`gap-2 bg-transparent ${isQuizActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isQuizActive}
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
