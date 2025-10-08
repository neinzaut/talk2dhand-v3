import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface DailyQuestCardProps {
  streak: number
  totalXP: number
}

export function DailyQuestCard({ streak, totalXP }: DailyQuestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Quest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Daily Streak</p>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Flame className="h-8 w-8 text-yellow-500" />
            </div>
            <span className="text-4xl font-bold">{streak} Days</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">Total XP</p>
          <p className="text-4xl font-bold">{totalXP} XP</p>
        </div>
      </CardContent>
    </Card>
  )
}
