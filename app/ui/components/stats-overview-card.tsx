"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { XPProgressBar } from "@/components/shared/XPProgressBar"
import { useAppStore } from "@/store/app-store"

interface StatsOverviewCardProps {
  streak: number
  isStreakActive: boolean
}

export function StatsOverviewCard({ streak, isStreakActive }: StatsOverviewCardProps) {
  const { getCurrentLanguageStats, badges, currentLanguage } = useAppStore()
  const stats = getCurrentLanguageStats()
  const [prevStats, setPrevStats] = useState(stats)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prevStreak, setPrevStreak] = useState(streak)
  const [isStreakAnimating, setIsStreakAnimating] = useState(false)

  // Handle language change transitions
  useEffect(() => {
    if (
      prevStats.xp !== stats.xp ||
      prevStats.level !== stats.level ||
      prevStats.currentLevelXP !== stats.currentLevelXP
    ) {
      setIsTransitioning(true)
      setPrevStats(stats)
      
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [stats, prevStats])

  // Animate when streak updates
  useEffect(() => {
    if (streak !== prevStreak && streak > prevStreak) {
      setIsStreakAnimating(true)
      const timer = setTimeout(() => {
        setIsStreakAnimating(false)
        setPrevStreak(streak)
      }, 600)
      return () => clearTimeout(timer)
    }
    setPrevStreak(streak)
  }, [streak, prevStreak])

  // Get recent badges (latest 6)
  const recentBadges = badges
    .sort((a, b) => b.earnedAt - a.earnedAt)
    .slice(0, 6)

  // Calculate max XP for current level
  const maxXP = stats.level === 1 ? 100 : stats.level === 2 ? 200 : 0
  const nextLevel = stats.level < 3 ? stats.level + 1 : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and XP Progress */}
        <div
          className={`transition-all duration-300 ${
            isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 shadow-md">
                <p className="text-sm font-semibold text-orange-100">LEVEL</p>
                <p className="text-3xl font-bold text-white">{stats.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {nextLevel ? (
                    <>
                      {stats.currentLevelXP} / {maxXP} XP to Level {nextLevel}
                    </>
                  ) : (
                    <>Max Level Reached!</>
                  )}
                </p>
              </div>
            </div>
          </div>

          <XPProgressBar
            currentXP={stats.currentLevelXP}
            maxXP={maxXP || stats.currentLevelXP}
            level={stats.level}
            animated={true}
            height="h-4"
          />
        </div>

        {/* Total XP */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Total XP ({currentLanguage.toUpperCase()})</p>
          <p
            className={`text-4xl font-bold transition-all duration-300 ${
              isTransitioning ? "opacity-50" : "opacity-100"
            }`}
          >
            {stats.xp} XP
          </p>
        </div>

        {/* Streak - Conditional */}
        {isStreakActive && (
          <div className="border-t pt-4">
            <p className="mb-2 text-sm text-muted-foreground">Daily Streak</p>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 transition-all duration-300 ${
                  isStreakAnimating
                    ? "scale-110 shadow-lg shadow-yellow-300/50"
                    : "scale-100"
                }`}
              >
                <img
                  src="/icons/streak.png"
                  alt="Streak"
                  className={`h-8 w-8 transition-all duration-300 ${
                    isStreakAnimating ? "animate-pulse brightness-125" : ""
                  }`}
                />
              </div>
              <span
                className={`text-3xl font-bold transition-all duration-300 ${
                  isStreakAnimating ? "scale-110 text-orange-500" : "scale-100"
                }`}
              >
                {streak} Days
              </span>
            </div>
          </div>
        )}

        {/* Badges Showcase */}
        {recentBadges.length > 0 && (
          <div className="border-t pt-4">
            <p className="mb-3 text-sm text-muted-foreground">Recent Badges</p>
            <div className="grid grid-cols-3 gap-2">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="group relative flex flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3 transition-all hover:scale-105 hover:shadow-md"
                  title={badge.name}
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <span className="text-center text-xs font-medium text-gray-700 line-clamp-2">
                    {badge.name}
                  </span>
                  
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    <p className="whitespace-nowrap font-semibold">{badge.name}</p>
                    <p className="mt-1 max-w-xs text-gray-300">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
