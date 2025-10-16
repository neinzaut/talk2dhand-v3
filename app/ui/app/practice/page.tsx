"use client"

import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { useRouter } from "next/navigation"
import { PlayCircle, Target, Trophy } from "lucide-react"

export default function PracticePage() {
  const router = useRouter()

  const practiceOptions = [
    {
      title: "Text-to-Sign",
      description: "Enter any word or phrase and see its ASL or FSL sign instantly — perfect for learning new vocabulary visually.",
      icon: <Target className="h-8 w-8" />,
      action: () => router.push("/practice/text-to-sign"),
      color: "bg-blue-500"
    },
    {
      title: "Audio-to-Sign",
      description: "Say a word or phrase out loud and watch its corresponding sign animation — helping bridge sound and sign.",
      icon: <PlayCircle className="h-8 w-8" />,
      action: () => router.push("/practice/audio-to-sign"),
      color: "bg-orange-500"
    },
    {
      title: "Camera-to-Sign",
      description: "Use your camera to perform a sign and get AI-powered recognition with accuracy scores. Practice, correct, and improve.",
      icon: <Trophy className="h-8 w-8" />,
      action: () => router.push("/practice/camera-to-sign"),
      color: "bg-green-500"
    },
    {
      title: "Memory Game",
      description: "A fun way to strengthen your memory — match signs to their meanings through levels that get more challenging as you improve.",
      icon: <PlayCircle className="h-8 w-8" />,
      action: () => router.push("/practice/memory-game"),
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Practice</h1>
        <p className="text-lg text-muted-foreground">
          Your interactive space to master sign language through hands-on practice. Choose how you want to learn — type, speak, sign, or play.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    </div>
  )
}