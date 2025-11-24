import React, { useState } from 'react';
import { CEFRLevel, UserProfile, Language } from '../types';
import { Button } from './Button';
import { t } from '../utils/translations';

interface OnboardingProps {
  onComplete: (profile: Omit<UserProfile, 'points' | 'streak' | 'lastLoginDate' | 'badges' | 'articlesRead'>) => void;
  lang: Language;
}

const INTEREST_TAGS = [
  "Technology", "Business", "Culture", "Travel", 
  "Lifestyle", "Health", "Entertainment", "Sports", 
  "History", "Gaming"
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang }) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<CEFRLevel | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState('');

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => {
    if (step === 1 && level) setStep(2);
    else if (step === 2) {
      onComplete({
        level: level!,
        interests: selectedInterests,
        customKeywords
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('welcome', lang)}</h1>
        <p className="text-slate-500">{t('subtitle', lang)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t('chooseLevel', lang)}</h2>
            <div className="grid gap-3">
              {Object.values(CEFRLevel).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${
                    level === l 
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold' 
                      : 'border-slate-100 hover:border-brand-200 text-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{t('interests', lang)}</h2>
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedInterests.includes(tag)
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('customTopics', lang)}
              </label>
              <input
                type="text"
                placeholder="e.g., AI, Baking, Premier League"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleNext} 
            disabled={(step === 1 && !level) || (step === 2 && selectedInterests.length === 0 && !customKeywords)}
            className="w-full sm:w-auto"
          >
            {step === 1 ? t('nextStep', lang) : t('startJourney', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
};
