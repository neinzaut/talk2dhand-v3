"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/shared/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { Progress } from "@/components/shared/progress"
import { CheckCircle, XCircle, RotateCw, Sparkles, Lightbulb, ChevronDown } from "lucide-react"
import { GrammarPracticeItem, getLanguagePracticeItems } from "@/store/data/grammar-practice"
import { GrammarQuizItem, getQuizItems } from "@/store/data/grammar-quiz"
import { useAppStore } from "@/store/app-store"

interface GrammarPracticeComponentProps {
  language: "asl" | "fsl"
  mode: "practice" | "quiz"
  onComplete?: (score: number, total: number) => void
}

type FeedbackType = "correct" | "incorrect" | null

const GrammarPracticeComponent: React.FC<GrammarPracticeComponentProps> = ({
  language,
  mode,
  onComplete,
}) => {
  const { addXP } = useAppStore()
  const [practiceItems, setPracticeItems] = useState<(GrammarPracticeItem | GrammarQuizItem)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const [showRationale, setShowRationale] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [itemScores, setItemScores] = useState<Record<number, boolean>>({})

  useEffect(() => {
    // Get items based on mode
    const items = mode === "quiz" ? getQuizItems(language) : getLanguagePracticeItems(language)
    setPracticeItems(items)

    // Reset state when mode changes
    setCurrentIndex(0)
    setUserAnswers({})
    setFeedback(null)
    setCorrectCount(0)
    setIsComplete(false)
    setUserAnswer("")
    setShowRationale(false)
    setShowHint(false)
    setUsedHint(false)
    setItemScores({})
  }, [language, mode])

  const currentItem = practiceItems[currentIndex]
  const isAnswered = feedback !== null
  const progressPercent = ((currentIndex + 1) / practiceItems.length) * 100

  const normalizeGloss = (gloss: string): string => {
    // Remove extra whitespace, convert to uppercase, and trim
    return gloss
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/[""]/g, '"')
  }

  const getDynamicHint = (correctGloss: string, userInput: string): string => {
    const correctWords = normalizeGloss(correctGloss).split(" ")
    const userWords = normalizeGloss(userInput).split(" ")

    return correctWords
      .map((word, idx) => {
        // If user has typed something at this position and it matches, show it
        if (userWords[idx] && userWords[idx] === word) {
          return word
        }
        // Otherwise show underscores
        return "_".repeat(Math.max(1, word.length - 1))
      })
      .join(" ")
  }

  const handleHintClick = () => {
    setShowHint(true)
    setUsedHint(true)
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please enter a gloss before submitting")
      return
    }

    const normalizedUser = normalizeGloss(userAnswer)
    const normalizedCorrect = normalizeGloss(currentItem.correctGloss)

    const isCorrect = normalizedUser === normalizedCorrect
    setFeedback(isCorrect ? "correct" : "incorrect")
    setShowRationale(true)

    // Track the score for this item
    setItemScores((prev) => ({
      ...prev,
      [currentIndex]: isCorrect,
    }))

    // Update correct count and award XP
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      // Award more XP if hint wasn't used
      const xpReward = usedHint ? 8 : 10
      addXP(xpReward)
    } else {
      addXP(2) // Small XP consolation for trying
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: userAnswer,
    }))
  }

  const handleNext = () => {
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setUserAnswer("")
      setFeedback(null)
      setShowRationale(false)
      setShowHint(false)
      setUsedHint(false)
    } else {
      setIsComplete(true)
      // Calculate final score from itemScores
      const finalScore = Object.values(itemScores).filter((score) => score === true).length
      onComplete?.(finalScore, practiceItems.length)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setUserAnswers({})
    setFeedback(null)
    setCorrectCount(0)
    setIsComplete(false)
    setUserAnswer("")
    setShowRationale(false)
    setShowHint(false)
    setUsedHint(false)
    setItemScores({})
    const items = mode === "quiz" ? getQuizItems(language) : getLanguagePracticeItems(language)
    setPracticeItems(items)
  }

  if (practiceItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-600">Loading practice items...</p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    const totalCorrect = Object.values(itemScores).filter((score) => score === true).length
    const percentage = practiceItems.length > 0 ? Math.round((totalCorrect / practiceItems.length) * 100) : 0
    const isPerfect = percentage === 100;
    const isGreat = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <Card className={`w-full bg-white border-0 shadow-lg ${
        isPerfect ? 'ring-4 ring-yellow-300' :
        isGreat ? 'ring-4 ring-blue-300' :
        isGood ? 'ring-4 ring-green-300' :
        'ring-2 ring-gray-200'
      }`}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
              isPerfect ? 'bg-yellow-100' :
              isGreat ? 'bg-blue-100' :
              isGood ? 'bg-green-100' :
              'bg-gray-100'
            } shadow-lg`}>
              <span className={`text-4xl font-bold ${
                isPerfect ? 'text-yellow-600' :
                isGreat ? 'text-blue-600' :
                isGood ? 'text-green-600' :
                'text-gray-600'
              }`}>{percentage}%</span>
            </div>
          </div>
          <CardTitle className={`text-3xl font-black ${
            isPerfect ? 'text-yellow-600' :
            isGreat ? 'text-blue-600' :
            isGood ? 'text-green-600' :
            'text-gray-700'
          }`}>
            {isPerfect ? '🎉 Perfect! 🎉' :
             isGreat ? '🌟 Excellent! 🌟' :
             isGood ? '👍 Good Job! 👍' :
             'Keep Practicing!'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isPerfect ? 'You mastered this lesson!' :
             isGreat ? 'Keep up the great work!' :
             isGood ? 'Practice more to improve!' :
             "You'll improve with practice!"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className={`text-2xl font-bold mb-2 ${
              isPerfect ? 'text-yellow-600' :
              isGreat ? 'text-blue-600' :
              isGood ? 'text-green-600' :
              'text-gray-700'
            }`}>
              {totalCorrect} / {practiceItems.length}
            </p>
            <p className="text-sm text-gray-500">Questions Correct</p>
          </div>

          <div className={`rounded-lg p-5 ${
            isPerfect ? 'bg-yellow-50' :
            isGreat ? 'bg-blue-50' :
            isGood ? 'bg-green-50' :
            'bg-gray-50'
          }`}>
            <h3 className="font-semibold text-gray-800 mb-4 text-center">📊 Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-black text-green-600">{totalCorrect}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">✅ Correct</div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-black text-red-600">
                  {practiceItems.length - totalCorrect}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">❌ Incorrect</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleReset}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 rounded-lg transition-all hover:shadow-lg"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Progress</h2>
          <span className="text-sm font-bold text-indigo-600">
            {currentIndex + 1} / {practiceItems.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Correct: {correctCount}</span>
          <span>Language: {language.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Practice Card */}
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="bg-blue-50 border-b border-gray-200">
          <CardTitle className="text-gray-800">Sentence #{currentIndex + 1}</CardTitle>
          <p className="text-sm text-gray-600 font-normal mt-2">
            Write the correct {language.toUpperCase()} gloss for this sentence
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Sentence Display */}
          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <p className="text-gray-600 text-sm font-semibold mb-1">English Sentence:</p>
            <p className="text-2xl font-bold text-gray-900 leading-relaxed">
              {currentItem?.sentence}
            </p>
          </div>

          {/* Hint System */}
          {!isAnswered && (
            <div className="space-y-2">
              <button
                onClick={handleHintClick}
                disabled={showHint}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  showHint
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-50 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-100"
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? "Hint Enabled" : "Get Hint"}
              </button>
              {showHint && (
                <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                  <p className="text-xs font-semibold text-gray-600 mb-2">💡 Hint:</p>
                  <p className="font-mono text-sm text-gray-800 break-words tracking-wider">
                    {getDynamicHint(currentItem?.correctGloss || "", userAnswer)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Type your answer above - matching words will appear in the hint!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              {language.toUpperCase()} Gloss:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter the gloss (e.g., YOU HOW?)"
              disabled={isAnswered}
              className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm focus:outline-none transition-colors ${
                isAnswered ? "bg-gray-100 text-gray-600 border-gray-300" : "border-gray-300 bg-white focus:border-indigo-500 focus:bg-indigo-50"
              } ${feedback === "correct" ? "border-green-400 bg-green-50" : feedback === "incorrect" ? "border-red-400 bg-red-50" : ""}`}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Tip: Use UPPERCASE for signs, separate with spaces, use hyphens for compound signs (e.g., GO-TO)
            </p>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div
              className={`rounded-lg p-4 space-y-3 ${
                feedback === "correct"
                  ? "bg-green-50 border-2 border-green-300"
                  : "bg-red-50 border-2 border-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback === "correct" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-bold text-green-700">Correct!</p>
                    {usedHint && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded ml-auto font-semibold flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Hint Used
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="font-bold text-red-700">Not quite right</p>
                  </>
                )}
              </div>

              {feedback === "incorrect" && (
                <div className="bg-white rounded p-3 space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Your answer:</span> {userAnswer}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-green-600">Correct answer:</span>{" "}
                    {currentItem?.correctGloss}
                  </p>
                </div>
              )}

              {showRationale && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-sm font-semibold text-gray-800 mb-2">📖 Linguistic Rationale:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentItem?.rationale}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isAnswered ? (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-md"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-md"
              >
                {currentIndex === practiceItems.length - 1 ? "See Results" : "Next"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GrammarPracticeComponent
