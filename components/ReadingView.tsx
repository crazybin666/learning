import React, { useState, useRef } from 'react';
import { ArticleData, VocabularyWord, Language } from '../types';
import { Button } from './Button';
import { generateSpeech } from '../services/geminiService';
import { t } from '../utils/translations';

interface ReadingViewProps {
  article: ArticleData;
  onFinish: () => void;
  lang: Language;
}

// Helper to sanitize word for matching
const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');

export const ReadingView: React.FC<ReadingViewProps> = ({ article, onFinish, lang }) => {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse content to identify interactive words
  const renderContent = () => {
    // Regex to capture content between {{ and }}
    const parts = article.content.split(/(\{\{.*?\}\})/g);

    return parts.map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const wordText = part.slice(2, -2);
        // Find the definition
        const vocabEntry = article.vocabulary.find(v => 
           cleanWord(v.word) === cleanWord(wordText) || wordText.includes(v.word)
        ) || { word: wordText, definition: 'Definition unavailable', translation: '暂无翻译' };

        return (
          <span
            key={index}
            onClick={() => setSelectedWord(vocabEntry)}
            className="cursor-pointer text-brand-700 font-bold bg-brand-50 hover:bg-brand-200 border-b-2 border-brand-300 px-1 rounded transition-colors"
          >
            {wordText}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handlePlayAudio = async () => {
    if (audioUrl) {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            audioRef.current?.play();
            setIsPlaying(true);
        }
        return;
    }

    setIsLoadingAudio(true);
    try {
        const base64 = await generateSpeech(article.content);
        const url = `data:audio/mp3;base64,${base64}`;
        setAudioUrl(url);
        // Little delay to ensure state updates before playing
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 100);
    } catch (e) {
        alert("Could not generate audio.");
    } finally {
        setIsLoadingAudio(false);
    }
  };

  const playWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 relative">
      {/* Audio Element Hidden */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)} 
      />

      <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold font-serif text-slate-900 leading-tight">
          {article.title}
        </h1>
        <Button 
            variant="ghost" 
            onClick={handlePlayAudio}
            isLoading={isLoadingAudio}
            className="shrink-0 ml-4 rounded-full w-12 h-12 p-0 flex items-center justify-center border border-slate-200"
            title={isPlaying ? "Pause" : "Listen to article"}
        >
            {isPlaying ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
        </Button>
      </div>

      <div className="article-text text-lg text-slate-800 mb-12">
        {renderContent()}
      </div>

      <div className="flex justify-center mb-12">
        <Button onClick={onFinish} className="w-full sm:w-auto shadow-xl shadow-brand-500/30">
          {t('finishReading', lang)}
        </Button>
      </div>

      {/* Vocabulary Modal/Sheet */}
      {selectedWord && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-lg pointer-events-auto animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold text-slate-900">{selectedWord.word}</h3>
              <button 
                onClick={() => setSelectedWord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <button 
                onClick={() => playWord(selectedWord.word)}
                className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Definition</span>
                <p className="text-slate-700 text-lg leading-snug">{selectedWord.definition}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chinese</span>
                <p className="text-slate-900 font-medium text-lg">{selectedWord.translation}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100">
               <Button variant="secondary" className="w-full py-2 text-sm" onClick={() => {
                   // Placeholder for adding to saved words
                   setSelectedWord(null);
               }}>
                   Add to Flashcards
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
