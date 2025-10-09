"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PlayCircle, Target, Trophy } from "lucide-react"

export default function PracticePage() {
  const router = useRouter()

  const practiceOptions = [
    {
      title: "Quick Practice",
      description: "Practice random signs with instant feedback",
      icon: <Target className="h-8 w-8" />,
      action: () => router.push("/learn/lessons/lesson1"),
      color: "bg-blue-500"
    },
    {
      title: "Challenge Mode",
      description: "Test your skills with timed challenges",
      icon: <Trophy className="h-8 w-8" />,
      action: () => router.push("/learn/lessons/lesson2"),
      color: "bg-orange-500"
    },
    {
      title: "Free Practice",
      description: "Practice any sign with camera recognition",
      icon: <PlayCircle className="h-8 w-8" />,
      action: () => router.push("/learn/lessons/lesson3"),
      color: "bg-green-500"
    }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Practice</h1>
        <p className="text-lg text-muted-foreground">
          Choose your practice mode and improve your sign language skills with interactive exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {practiceOptions.map((option, index) => (
          <Card 
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={option.action}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`${option.color} p-4 rounded-full text-white group-hover:scale-110 transition-transform duration-300`}>
                {option.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-muted-foreground">{option.description}</p>
              </div>
              <Button variant="default" className="w-full">
                Start Practice
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold mb-4">Practice Tips</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Make sure you have good lighting for better camera recognition</li>
            <li>• Keep your hands visible and well-positioned in front of the camera</li>
            <li>• Practice regularly to improve your muscle memory</li>
            <li>• Start with basic signs and gradually move to more complex ones</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}