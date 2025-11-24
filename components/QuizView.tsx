import React, { useState } from 'react';
import { Question, Language } from '../types';
import { Button } from './Button';
import { t } from '../utils/translations';

interface QuizViewProps {
  questions: Question[];
  onComplete: (score: number) => void;
  lang: Language;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score + (selectedOption === currentQuestion.correctIndex ? 1 : 0) - (isAnswered && selectedOption === currentQuestion.correctIndex ? 1 : 0)); 
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto p-6">
        <div className="mb-8">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-right text-sm text-slate-400 mt-2">Question {currentIndex + 1} of {questions.length}</p>
        </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full p-4 rounded-xl text-left border-2 transition-all font-medium ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                itemClass += "border-green-500 bg-green-50 text-green-800";
              } else if (idx === selectedOption) {
                itemClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                itemClass += "border-slate-100 text-slate-400 opacity-50";
              }
            } else {
              if (idx === selectedOption) {
                itemClass += "border-brand-500 bg-brand-50 text-brand-900";
              } else {
                itemClass += "border-slate-100 hover:border-brand-200 text-slate-700 hover:bg-slate-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={itemClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl ${selectedOption === currentQuestion.correctIndex ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
            <div className="flex items-center gap-2 mb-2 font-bold">
                {selectedOption === currentQuestion.correctIndex ? (
                    <span className="text-green-700">Correct!</span>
                ) : (
                    <span className="text-orange-700">Incorrect</span>
                )}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!isAnswered ? (
          <Button onClick={handleSubmit} disabled={selectedOption === null}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
};
