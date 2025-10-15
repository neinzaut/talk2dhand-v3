import React, { useState, useEffect } from "react";
import { Button } from "@/components/shared/button";

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
}

const QuizComponent: React.FC<QuizComponentProps> = ({ signs, currentLanguage, onComplete }) => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentQuizItemIndex, setCurrentQuizItemIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);

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
      return {
        imageUrl: `/images/${language}-unlabelled/${sign.id}.png`, // Use unlabelled images
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
    if (selectedOption === currentItem.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    handleNextQuizItem();
  };

  const handleFinishQuiz = () => {
    if (onComplete) {
      onComplete(score);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {quizCompleted ? (
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-primary">Quiz Completed!</h2>
          <div className="space-y-4">
            <p className="text-lg">Your Score: {score}/{quizItems.length}</p>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div 
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${(score / quizItems.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-6 mt-8">
            <h3 className="text-xl font-semibold">Review Your Answers</h3>
            {quizItems.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl}
                    alt={`Question ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-sm text-gray-600">Correct Answer: {item.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
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