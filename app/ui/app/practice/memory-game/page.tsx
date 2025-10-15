"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/shared/card"
import { Button } from "@/components/shared/button"
import { useAppStore } from "@/store/app-store"
import { aslData } from "@/store/data/asl-data"
import { fslData } from "@/store/data/fsl-data"
import { HowToPlayModal } from "@/components/practice/HowToPlayModal"
import { ScoreModal } from "@/components/practice/ScoreModal"

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const CARDS_PER_ROUND = 6
const ROUND_TIME = 40 // seconds
const MAX_ROUNDS = 3
const SHOW_ALL_DURATION = 3000 // ms

export default function MemoryGamePage() {
  const currentLanguage = useAppStore((state) => state.currentLanguage)
  const [round, setRound] = useState(1)
  const [timer, setTimer] = useState(ROUND_TIME)
  // Remove score state, use roundScores for total
  const [gameOver, setGameOver] = useState(false)
  const [cards, setCards] = useState<any[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [disableAll, setDisableAll] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [showPlusOne, setShowPlusOne] = useState<{idx: number, visible: boolean} | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [roundScore, setRoundScore] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])

  // Get sign data for current language
  const signData = currentLanguage === "asl"
    ? [...aslData.modules[0].lessons[0].signs, ...aslData.modules[0].lessons[1].signs]
    : [...fslData.modules[0].lessons[0].signs]

  // Prepare cards for the round
  useEffect(() => {
    const roundSigns = shuffle(signData).slice(0, CARDS_PER_ROUND)
    // Each pair: one image (unlabelled), one label
    const cardPairs = roundSigns.flatMap((sign) => [
      { type: "image", value: sign.label, imageUrl: sign.imageUrl.replace("-labelled/", "-unlabelled/") },
      { type: "label", value: sign.label }
    ])
    setCards(shuffle(cardPairs))
    setFlipped([])
    setMatched([])
    setSelected(null)
    setTimer(ROUND_TIME)
    setDisableAll(true)
    setShowAll(true)
    setRoundScore(0)
    setTimeout(() => {
      setShowAll(false)
      setDisableAll(false)
    }, SHOW_ALL_DURATION)
  }, [round, currentLanguage])

  // Timer logic
  useEffect(() => {
    if (gameOver) return
    if (timer === 0) {
      setGameOver(true)
      return
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timer, gameOver])

  // Card click handler
  const handleCardClick = (idx: number) => {
    if (disableAll || flipped.includes(idx) || matched.includes(idx) || timer === 0 || gameOver) return
    if (selected === null) {
      setFlipped([idx])
      setSelected(idx)
    } else {
      setFlipped([selected, idx])
      setDisableAll(true)
      // Check for match
      setTimeout(() => {
        const cardA = cards[selected]
        const cardB = cards[idx]
        if (
          cardA.value === cardB.value &&
          cardA.type !== cardB.type
        ) {
          setMatched((prev) => [...prev, selected, idx])
          setRoundScore((s) => s + 1)
          setShowPlusOne({ idx, visible: true })
          setTimeout(() => setShowPlusOne(null), 700)
        }
        setFlipped([])
        setSelected(null)
        setDisableAll(false)
      }, 1000)
    }
  }

  // Automatically proceed to next round, accumulate score only at end of round
  useEffect(() => {
    if (gameOver && showScoreModal && round < MAX_ROUNDS) {
      setRoundScores((prev) => {
        const updated = [...prev];
        updated[round - 1] = roundScore;
        return updated;
      });
    }
    // For the last round, update roundScores only once
    if (gameOver && showScoreModal && round === MAX_ROUNDS && roundScores.length < MAX_ROUNDS) {
      setRoundScores((prev) => {
        const updated = [...prev];
        updated[round - 1] = roundScore;
        return updated;
      });
    }
  }, [gameOver, showScoreModal, round, roundScore, roundScores.length]);

  // Automatically advance to next round after showing round score for 1.5s
  useEffect(() => {
    if (showScoreModal && gameOver && round < MAX_ROUNDS) {
      const timeout = setTimeout(() => {
        setShowScoreModal(false);
        setRoundScore(0);
        setFlipped([]);
        setMatched([]);
        setSelected(null);
        setDisableAll(false);
        setShowAll(true);
        setTimeout(() => {
          setShowAll(false);
          setDisableAll(false);
        }, SHOW_ALL_DURATION);
        setRound((r) => r + 1);
        setGameOver(false);
        setTimer(ROUND_TIME);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showScoreModal, gameOver, round]);

  // All pairs matched
  useEffect(() => {
    if (matched.length === CARDS_PER_ROUND * 2 && !gameOver) {
      setTimeout(() => {
        setGameOver(true);
        setShowScoreModal(true);
      }, 800);
    }
  }, [matched, gameOver]);

  // When time runs out, show score modal
  useEffect(() => {
    if (timer === 0 && !gameOver) {
      setGameOver(true);
      setShowScoreModal(true);
    }
  }, [timer, gameOver]);

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      {/* Title and How to Play button on same row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Memory Game</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow"
        >
          How to Play
        </Button>
      </div>
      <p className="text-lg text-muted-foreground mb-6">
        Match each unlabelled sign to its correct label. Complete all rounds!
      </p>
      {/* Progress bar and timer row */}
      <div className="flex items-center justify-between mb-6 w-full max-w-xl mx-auto">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-500" style={{ width: `${(round-1)/(MAX_ROUNDS-1)*100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {[...Array(MAX_ROUNDS)].map((_, i) => (
              <span key={i} className={i+1 === round ? "font-bold text-blue-700" : ""}>Round {i+1}</span>
            ))}
          </div>
        </div>
        <span className={`ml-6 text-lg font-semibold px-4 py-1 rounded-full ${timer <= 10 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
          Time Left: {timer}s
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, idx) => {
          const isFlipped = showAll || flipped.includes(idx) || matched.includes(idx)
          return (
            <Card
              key={idx}
              className={
                "h-32 flex items-center justify-center cursor-pointer text-xl font-bold border-4 transition-all relative " +
                (matched.includes(idx)
                  ? "border-green-400 bg-green-50"
                  : isFlipped
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50")
              }
              onClick={() => handleCardClick(idx)}
            >
              {isFlipped ? (
                card.type === "image" ? (
                  <img src={card.imageUrl} alt={card.value} className="h-20 object-contain mx-auto" />
                ) : (
                  <span>{card.value}</span>
                )
              ) : (
                <span className="text-gray-400">?</span>
              )}
              {/* +1 indicator */}
              {showPlusOne && showPlusOne.idx === idx && showPlusOne.visible && (
                <span className="absolute top-2 right-2 text-green-600 text-xl font-bold animate-bounce">+1</span>
              )}
            </Card>
          )
        })}
      </div>
      {/* Score Modal */}
      <ScoreModal
        open={showScoreModal && round === MAX_ROUNDS && gameOver}
        score={roundScores.reduce((a, b) => a + b, 0)}
        roundScores={roundScores}
        cardsPerRound={CARDS_PER_ROUND}
        maxRounds={MAX_ROUNDS}
        isGameOver={round === MAX_ROUNDS && gameOver}
        onPlayAgain={() => {
          setRound(1);
          setGameOver(false);
          setShowScoreModal(false);
          setRoundScore(0);
          setRoundScores([]);
        }}
      />
      {/* How To Play Modal */}
      <HowToPlayModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}