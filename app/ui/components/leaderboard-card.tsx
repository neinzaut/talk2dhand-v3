import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/avatar"
import { Trophy, Medal, Award } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LeaderboardEntry } from "@/store/app-store"

interface LeaderboardCardProps {
  leaderboard: LeaderboardEntry[]
}

export function LeaderboardCard({ leaderboard }: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return Trophy
    if (rank === 2) return Medal
    if (rank === 3) return Award
    return null
  }

  const getIconColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"
    if (rank === 2) return "text-gray-400"
    if (rank === 3) return "text-orange-600"
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const rank = index + 1
            const RankIcon = getRankIcon(rank)

            return (
              <div key={user.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {RankIcon ? <RankIcon className={`h-4 w-4 ${getIconColor(rank)}`} /> : rank}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/icons/icon-user.png" alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.xp.toLocaleString()} XP</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span>{Math.abs(user.change)}</span>
                  {user.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
