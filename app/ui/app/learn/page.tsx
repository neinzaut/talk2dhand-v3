"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DailyQuestCard } from "@/components/daily-quest-card"
import { LeaderboardCard } from "@/components/leaderboard-card"
import { CheckCircle2, Circle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import Link from "next/link"

export default function LearnPage() {
  const { streak, totalXP, getCurrentModules, getCurrentLeaderboard, getCurrentLesson } = useAppStore()
  const modules = getCurrentModules()
  const leaderboard = getCurrentLeaderboard()
  const currentModule = modules[0]
  const currentLesson = getCurrentLesson()

  return (
    <div className="flex gap-6 p-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Jump back into - Now uses dynamic current lesson */}
        {currentLesson && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">Jump back into</h2>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-orange-500 bg-white">
                    <div className="text-center text-sm font-bold text-black whitespace-pre-line">
                      {currentLesson.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{currentLesson.title.split(":")[0]}</h3>
                    <p className="text-muted-foreground">{currentLesson.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Progress value={currentLesson.progress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{currentLesson.progress}%</span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Already know this */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-xl font-bold">Already know this?</h3>
              <p className="text-muted-foreground">Take the Module Test to skip the course.</p>
            </div>
            <Button size="lg">Answer</Button>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="text-8xl">🤖</div>
              </div>
              <h3 className="mb-4 text-center text-2xl font-bold">Converse with AI</h3>
              <Button className="w-full" size="lg">
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="text-8xl">💬</div>
              </div>
              <h3 className="mb-4 text-center text-2xl font-bold">Daily Practice</h3>
              <Button className="w-full" size="lg">
                Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learn Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Learn</h2>
            <Link href={`/learn/modules/${currentModule.id}`}>
              <Button variant="link" className="text-primary">
                See More
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-orange-500 bg-white">
                    <div className="text-center text-sm font-bold text-black">
                      <div>aα</div>
                      <div>aA</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{currentModule.title}</h3>
                    <p className="text-muted-foreground">{currentModule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={currentModule.progress} className="h-2 w-48" />
                  <span className="text-sm font-medium">{currentModule.progress}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {currentModule.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 text-muted-foreground">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                    <span>{lesson.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 space-y-6">
        <DailyQuestCard streak={streak} totalXP={totalXP} />
        <LeaderboardCard leaderboard={leaderboard} />
      </aside>
    </div>
  )
}
