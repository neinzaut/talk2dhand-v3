import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DailyQuestCard } from "@/components/daily-quest-card"
import { Leaderboard } from "@/components/leaderboard"
import { CheckCircle2, Circle } from "lucide-react"

export default function LearnDashboardPage() {
  return (
    <main className="ml-60 pt-16">
      <div className="flex gap-6 p-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Jump back into */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">Jump back into</h2>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-orange-500 bg-white">
                    <div className="text-center text-sm font-bold">
                      <div>aα</div>
                      <div>aA</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Lesson 1</h3>
                    <p className="text-muted-foreground">Alphabets</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Progress value={100} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">100%</span>
                </div>
              </CardContent>
            </Card>
          </section>

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
              <Button variant="link" className="text-primary">
                See More
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-orange-500 bg-white">
                      <div className="text-center text-sm font-bold">
                        <div>aα</div>
                        <div>aA</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Module 1</h3>
                      <p className="text-muted-foreground">Basics of American Sign Language</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={40} className="h-2 w-48" />
                    <span className="text-sm font-medium">40%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Lesson 1: Alphabets</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Lesson 2: Numbers</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Circle className="h-5 w-5" />
                    <span>Lesson 3: Phrases</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Circle className="h-5 w-5" />
                    <span>Lesson 4: Grammar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 space-y-6">
          <DailyQuestCard streak={5} totalXP={1250} />
          <Leaderboard />
        </aside>
      </div>
    </main>
  )
}