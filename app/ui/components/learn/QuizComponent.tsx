import React, { useState, useEffect } from "react";
import { Button } from "@/components/shared/button";
import { useAppStore } from "@/store/app-store";
import Image from "next/image";
import { X } from "lucide-react";

interface QuizItem {
  imageUrl: string;
  options: string[];
  correctAnswer: string;
}

interface QuizComponentProps {
  signs: Array<{
    id: string;
    label: string;
    imageUrl: string;
  }>;
  currentLanguage: "asl" | "fsl";
  onComplete?: (score: number) => void;
  onQuizStateChange?: (isActive: boolean) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ 
  signs, 
  currentLanguage, 
  onComplete,
  onQuizStateChange 
}) => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentQuizItemIndex, setCurrentQuizItemIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  // Add a state to track user's answers
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (signs && signs.length > 0) {
      const items = generateRandomQuestions(signs, currentLanguage);
      console.log("Generated quiz items:", items);
      setQuizItems(items);
    }
  }, [signs, currentLanguage]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!quizCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleNextQuizItem();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentQuizItemIndex, quizCompleted]);

  const generateRandomQuestions = (signs: any[], language: "asl" | "fsl"): QuizItem[] => {
    const shuffledSigns = [...signs].sort(() => Math.random() - 0.5);
    return shuffledSigns.slice(0, 10).map((sign) => {
      const options = generateOptions(sign.label, signs);
      // Convert the labeled image URL to its unlabelled counterpart
      const unlabelledImageUrl = sign.imageUrl.replace('-labelled/', '-unlabelled/');
      return {
        imageUrl: unlabelledImageUrl,
        options,
        correctAnswer: sign.label,
      };
    });
  };

  const generateOptions = (correctAnswer: string, signs: any[]): string[] => {
    const otherOptions = signs
      .filter((sign) => sign.label !== correctAnswer)
      .map((sign) => sign.label)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [correctAnswer, ...otherOptions].sort(() => Math.random() - 0.5);
  };

  const handleNextQuizItem = () => {
    if (currentQuizItemIndex < quizItems.length - 1) {
      setCurrentQuizItemIndex(currentQuizItemIndex + 1);
      setTimer(10);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleAnswer = (selectedOption: string) => {
    const currentItem = quizItems[currentQuizItemIndex];
    // Update the handleAnswer function to store the user's answer
    setUserAnswers((prev) => ({ ...prev, [currentQuizItemIndex]: selectedOption }));

    if (selectedOption === currentItem.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    handleNextQuizItem();
  };

  const handleFinishQuiz = () => {
    // Award XP for completing the quiz (50 XP)
    const { addXP } = useAppStore.getState()
    addXP(50)
    
    // Notify parent that quiz is ending
    onQuizStateChange?.(false);
    if (onComplete) {
      onComplete(score);
    }
  };

  const percent = score / quizItems.length;
  const isPerfect = percent === 1;
  const isGreat = percent >= 0.8;
  const isGood = percent >= 0.6;

  return (
    <div className="max-w-2xl mx-auto">
      {quizCompleted ? (
        <div className={`relative bg-white p-8 rounded-lg shadow-lg space-y-6 ${isPerfect ? 'border-4 border-yellow-300' : isGreat ? 'border-4 border-blue-300' : isGood ? 'border-4 border-green-300' : 'border-2 border-gray-200'}`}>
          {/* Animated icon */}
          <div className="flex justify-center mb-2">
            <div className={`relative ${isPerfect ? 'animate-bounce' : ''}`}>
              {isPerfect && (
                <div className="absolute inset-0 animate-ping">
                  <Image src="/icons/excellent.png" alt="Excellent" width={64} height={64} className="opacity-50" />
                </div>
              )}
              {(() => {
                if (isPerfect) {
                  return <Image src="/icons/excellent.png" alt="Excellent" width={80} height={80} className="relative drop-shadow-xl" />;
                } else if (isGreat) {
                  return <Image src="/icons/fine.png" alt="Fine" width={80} height={80} className="relative drop-shadow-lg" />;
                } else if (isGood) {
                  return <Image src="/icons/good.png" alt="Good" width={80} height={80} className="relative drop-shadow-md" />;
                } else {
                  return <Image src="/icons/bad.png" alt="Bad" width={80} height={80} className="relative" />;
                }
              })()}
            </div>
          </div>

          {/* Title with emoji */}
          <div className="text-center space-y-2">
            <h2 className={`text-4xl font-black ${
              isPerfect ? 'text-yellow-600' :
              isGreat ? 'text-blue-600' :
              isGood ? 'text-green-600' :
              'text-gray-700'
            }`}>
              {isPerfect ? '🎉 Perfect Score! 🎉' :
               isGreat ? '🌟 Great Work! 🌟' :
               isGood ? '👍 Good Job! 👍' :
               'Keep Learning!'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isPerfect ? 'You got everything right!' :
               isGreat ? 'Almost perfect!' :
               isGood ? 'Nice effort!' :
               'Practice makes perfect!'}
            </p>
          </div>

          {/* Score display */}
          <div className="flex justify-center">
            <div className={`relative inline-flex items-center justify-center w-40 h-40 rounded-full ${
              isPerfect ? 'bg-yellow-100' :
              isGreat ? 'bg-blue-100' :
              isGood ? 'bg-green-100' :
              'bg-gray-100'
            } shadow-lg`}>
              <div className="text-center">
                <div className={`text-5xl font-black ${
                  isPerfect ? 'text-yellow-600' :
                  isGreat ? 'text-blue-600' :
                  isGood ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {score}
                </div>
                <div className="text-gray-500 text-sm font-semibold">out of {quizItems.length}</div>
                <div className={`text-2xl font-bold mt-1 ${
                  isPerfect ? 'text-yellow-500' :
                  isGreat ? 'text-blue-500' :
                  isGood ? 'text-green-500' :
                  'text-gray-500'
                }`}>
                  {Math.round(percent * 100)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-bold text-center text-gray-700">📝 Review Your Answers</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {quizItems.map((item, index) => {
                const isCorrect = userAnswers[index] === item.correctAnswer;
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                    isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl}
                        alt={`Question ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-700">Q{index + 1}</span>
                          {isCorrect ? (
                            <span className="text-lg">✅</span>
                          ) : (
                            <span className="text-lg">❌</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Your answer:</span> {userAnswers[index] || "No Answer"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700">
                            <span className="font-semibold">Correct:</span> {item.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">
              Question {currentQuizItemIndex + 1} of {quizItems.length}
            </span>
            <span className="text-lg font-bold text-orange-600">
              Time: {timer}s
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuizItemIndex) / quizItems.length) * 100}%` }}
            />
          </div>

          <div className="text-center py-4">
            <img
              src={quizItems[currentQuizItemIndex]?.imageUrl}
              alt="Quiz Item"
              className="w-48 h-48 mx-auto object-cover rounded-lg border-4 border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {quizItems[currentQuizItemIndex]?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                variant="default"
                className="h-12 text-lg font-medium border-2 border-gray-300 bg-white text-gray-800 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;