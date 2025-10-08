"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, Target, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Learn",
    href: "/learn",
    icon: GraduationCap,
  },
  {
    name: "Practice",
    href: "/practice",
    icon: Target,
  },
  {
    name: "AI Converse",
    href: "/ai-converse",
    icon: MessageSquare,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="text-2xl font-bold text-sidebar-foreground">Talk 👌 Hand</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
