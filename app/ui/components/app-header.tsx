"use client"

import { Flame, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore, type Language } from "@/store/app-store"

export function AppHeader() {
  const { streak, currentLanguage, setLanguage } = useAppStore()

  const languages = [
    { code: "asl" as Language, flag: "🇺🇸", name: "American Sign Language" },
    { code: "fsl" as Language, flag: "🇵🇭", name: "Filipino Sign Language" },
  ]

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0]

  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background px-6 pl-64">
      {/* Streak */}
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="text-lg font-bold">{streak}</span>
      </div>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <span className="text-lg">{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)} className="cursor-pointer">
              <span className="text-lg">{lang.flag}</span>
              <span className="ml-2">{lang.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Avatar */}
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
      </Avatar>
    </header>
  )
}
