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
          <div className="flex items-center gap-4">
            {/* Circular Level Indicator */}
            <div className="relative h-24 w-24 flex-shrink-0">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (maxXP ? stats.currentLevelXP / maxXP : 0))}`}
                  className="text-orange-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-muted-foreground">LEVEL</p>
                <p className="text-2xl font-bold text-orange-500">{stats.level}</p>
              </div>
            </div>

            {/* XP Progress Text */}
            <div>
              <p className="text-2xl font-semibold">
                {nextLevel ? (
                  <>
                    {maxXP - stats.currentLevelXP} XP
                  </>
                ) : (
                  <>Max Level!</>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {nextLevel ? `to Level ${nextLevel}` : "You've reached the top!"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total XP Card */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-blue-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Total XP ({currentLanguage.toUpperCase()})</span>
            </div>
            <p
              className={`text-2xl font-semibold transition-all duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {stats.xp.toLocaleString()}
            </p>
          </div>

          {/* Daily Streak Card */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-orange-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Daily Streak</span>
            </div>
            <p
              className={`text-2xl font-semibold transition-all duration-300 ${
                isStreakAnimating ? "scale-110 text-orange-500" : "scale-100"
              }`}
            >
              {streak} Days
            </p>
          </div>
        </div>

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
