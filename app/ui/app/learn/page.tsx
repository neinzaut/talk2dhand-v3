"use client"

import { Card, CardContent } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { Progress } from "@/components/shared/progress"
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
  
  // Find the latest incomplete lesson, or the last lesson if all are completed
  const getLatestLesson = () => {
    if (!currentModule || !currentModule.lessons.length) return null
    
    // Find the first incomplete lesson
    const incompleteLesson = currentModule.lessons.find(lesson => lesson.progress < 100)
    
    // If all lessons are complete, return the last lesson
    return incompleteLesson || currentModule.lessons[currentModule.lessons.length - 1]
  }
  
  const currentLesson = getLatestLesson()

  return (
    <div className="flex gap-6 p-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Jump back into - Now uses dynamic current lesson */}
        {currentLesson && (
          <section>
            <h2 className="mb-4 text-2xl font-bold">Jump back into</h2>
            <Link href={`/learn/lessons/${currentLesson.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
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
            </Link>
          </section>
        )}


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
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Learn</h2>
          </div>

          <Link href={`/learn/modules/${currentModule.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
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
                  <div key={lesson.id} className="flex items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {lesson.progress === 100 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : lesson.progress > 0 ? (
                        <div className="relative h-5 w-5">
                          <Circle className="h-5 w-5 text-gray-300" />
                          <div 
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(from 0deg, #10b981 0deg, #10b981 ${lesson.progress * 3.6}deg, transparent ${lesson.progress * 3.6}deg)`,
                              mask: 'radial-gradient(circle at center, transparent 60%, black 60%)'
                            }}
                          />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      <span className={lesson.progress === 100 ? "text-green-700 font-medium" : "text-muted-foreground"}>
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
                          style={{ width: `${lesson.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[3rem]">
                        {lesson.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>
          </Link>
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
