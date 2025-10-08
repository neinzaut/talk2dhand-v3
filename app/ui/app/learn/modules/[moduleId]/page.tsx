"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useParams, useRouter } from "next/navigation"

export default function ModuleOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const { getCurrentModules, setCurrentLesson } = useAppStore()
  const modules = getCurrentModules()
  const module = modules.find((m) => m.id === params.moduleId)

  if (!module) {
    return <div>Module not found</div>
  }

  const handleStartLesson = (lessonId: string) => {
    setCurrentLesson(lessonId)
    router.push(`/learn/lessons/${lessonId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold text-primary">{module.title}</h1>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <HelpCircle className="h-4 w-4" />
          How to Use?
        </Button>
      </div>

      <div className="h-1 bg-primary mb-8" />

      <div className="space-y-4 max-w-4xl">
        {module.lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-orange-500 bg-white">
                  <div className="text-center text-lg font-bold text-black whitespace-pre-line">{lesson.icon}</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{lesson.title}</h3>
                  <p className="text-muted-foreground">{lesson.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <Progress value={lesson.progress} className="h-2 w-48" />
                  <span className="text-sm font-medium w-12">{lesson.progress}%</span>
                </div>
                <Button size="lg" onClick={() => handleStartLesson(lesson.id)}>
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
