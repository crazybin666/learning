import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  UserProfile, 
  ArticleData, 
  Question,
  Badge,
  Language,
  ForumPost
} from './types';
import { Onboarding } from './components/Onboarding';
import { ReadingView } from './components/ReadingView';
import { QuizView } from './components/QuizView';
import { ForumView } from './components/ForumView';
import { Button } from './components/Button';
import { generateArticle, generateQuiz } from './services/geminiService';
import { t } from './utils/translations';

// Initial Badges
const BADGES: Badge[] = [
  { id: 'novice', name: 'Novice Reader', description: 'Read your first article', icon: '📖', unlocked: false },
  { id: 'streak3', name: 'On Fire', description: '3 Day Streak', icon: '🔥', unlocked: false },
  { id: 'scholar', name: 'Scholar', description: 'Earn 100 points', icon: '🎓', unlocked: false },
  { id: 'vocab', name: 'Vocabulary Master', description: 'Add 10 words to list', icon: '🧠', unlocked: false },
];

const INITIAL_POSTS: ForumPost[] = [
    {
        id: '1',
        title: 'How to remember idioms?',
        content: 'I keep forgetting idioms like "break a leg". Any tips?',
        author: 'Alice',
        category: 'Learning Strategies',
        timestamp: Date.now() - 1000000,
        comments: [],
        likes: 5
    },
    {
        id: '2',
        title: 'Tech Article Discussion',
        content: 'The article about Tesla was fascinating! The word "infrastructure" is useful.',
        author: 'Bob',
        category: 'Article Discussion',
        timestamp: Date.now() - 500000,
        comments: [],
        likes: 2
    }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  // Content State
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  
  // Forum State
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  
  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Handle Badge Logic
  const checkBadges = (profile: UserProfile): UserProfile => {
    let newBadges = [...profile.badges];
    let earnedNew = false;

    // Rule: First Article
    if (profile.articlesRead >= 1 && !newBadges.find(b => b.id === 'novice')?.unlocked) {
        newBadges = newBadges.map(b => b.id === 'novice' ? { ...b, unlocked: true } : b);
        earnedNew = true;
        setNotification(`🏆 Badge Unlocked: Novice Reader!`);
    }

    // Rule: 100 Points
    if (profile.points >= 100 && !newBadges.find(b => b.id === 'scholar')?.unlocked) {
        newBadges = newBadges.map(b => b.id === 'scholar' ? { ...b, unlocked: true } : b);
        earnedNew = true;
        setNotification(`🏆 Badge Unlocked: Scholar!`);
    }

    // Rule: Streak
    if (profile.streak >= 3 && !newBadges.find(b => b.id === 'streak3')?.unlocked) {
        newBadges = newBadges.map(b => b.id === 'streak3' ? { ...b, unlocked: true } : b);
        earnedNew = true;
        setNotification(`🏆 Badge Unlocked: On Fire!`);
    }

    return earnedNew ? { ...profile, badges: newBadges } : profile;
  };

  const handleOnboardingComplete = (data: Omit<UserProfile, 'points' | 'streak' | 'lastLoginDate' | 'badges' | 'articlesRead'>) => {
    const initialProfile: UserProfile = {
        ...data,
        points: 0,
        streak: 1,
        lastLoginDate: new Date().toISOString(),
        badges: BADGES,
        articlesRead: 0
    };
    setUserProfile(initialProfile);
    setCurrentView(AppView.DASHBOARD);
  };

  const startLearningSession = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    setLoadingMessage(language === 'en' ? "AI is crafting your personalized article..." : "AI 正在为您生成专属文章...");
    
    try {
      const generatedArticle = await generateArticle(
        userProfile.level,
        userProfile.interests,
        userProfile.customKeywords
      );
      setArticle(generatedArticle);
      
      setLoadingMessage(language === 'en' ? "Generating comprehension questions..." : "正在生成理解测试题...");
      const generatedQuestions = await generateQuiz(generatedArticle.content);
      setQuestions(generatedQuestions);

      setCurrentView(AppView.READING);
    } catch (error) {
      alert("Failed to generate content. Please ensure a valid API KEY is set in the environment.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishReading = () => {
    if (userProfile) {
        // Award points for reading
        const updatedProfile = { 
            ...userProfile, 
            points: userProfile.points + 50,
            articlesRead: userProfile.articlesRead + 1
        };
        const checkedProfile = checkBadges(updatedProfile);
        setUserProfile(checkedProfile);
        setNotification("+50 Points for Reading! 📚");
    }
    setCurrentView(AppView.QUIZ);
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    
    if (userProfile) {
        // Award points for quiz
        const pointsEarned = score * 10;
        const updatedProfile = { ...userProfile, points: userProfile.points + pointsEarned };
        const checkedProfile = checkBadges(updatedProfile);
        setUserProfile(checkedProfile);
        if (pointsEarned > 0) setNotification(`+${pointsEarned} Points for Quiz! ✨`);
    }

    setCurrentView(AppView.REPORT);
  };

  const handleAddPost = (newPost: Omit<ForumPost, 'id' | 'comments' | 'likes' | 'timestamp'>) => {
      const post: ForumPost = {
          ...newPost,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          comments: [],
          likes: 0
      };
      setPosts([post, ...posts]);
      setNotification("Post published! 💬");
  };

  // Clear notification after 3s
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  // Views
  if (currentView === AppView.ONBOARDING) {
    return (
        <>
            <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')} className="px-3 py-1 bg-white border rounded-full text-sm font-semibold shadow-sm">
                    {language === 'en' ? '🇨🇳 中文' : '🇺🇸 English'}
                </button>
            </div>
            <Onboarding onComplete={handleOnboardingComplete} lang={language} />
        </>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-semibold text-slate-800 animate-pulse">{loadingMessage}</h2>
        <p className="text-slate-500 mt-2">Target: {userProfile?.level}</p>
      </div>
    );
  }

  const Navigation = () => (
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-2 flex justify-around z-40 pb-safe">
          <button 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`flex flex-col items-center p-2 rounded-xl ${currentView === AppView.DASHBOARD ? 'text-brand-600' : 'text-slate-400'}`}
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-xs font-medium mt-1">{t('home', language)}</span>
          </button>
          <button 
            onClick={() => setCurrentView(AppView.FORUM)}
            className={`flex flex-col items-center p-2 rounded-xl ${currentView === AppView.FORUM ? 'text-brand-600' : 'text-slate-400'}`}
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <span className="text-xs font-medium mt-1">{t('forum', language)}</span>
          </button>
          <div className="flex flex-col items-center p-2 text-slate-400">
             <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {userProfile?.level.substring(0,2)}
             </div>
             <span className="text-xs font-medium mt-1">{t('profile', language)}</span>
          </div>
      </nav>
  );

  const TopBar = () => (
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-sm">
                  🔥 {userProfile?.streak} <span className="hidden sm:inline">{t('streak', language)}</span>
              </div>
              <div className="flex items-center gap-1 text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full text-sm">
                  ⚡ {userProfile?.points} <span className="hidden sm:inline">{t('points', language)}</span>
              </div>
          </div>
          <button onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')} className="text-sm font-semibold text-slate-500 hover:text-brand-600">
            {language === 'en' ? '中文' : 'EN'}
          </button>
      </div>
  );

  const NotificationToast = () => (
      notification ? (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-[slideDown_0.3s_ease-out] flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span className="font-semibold">{notification}</span>
        </div>
      ) : null
  );

  const MainLayout: React.FC<{children: React.ReactNode}> = ({children}) => (
      <div className="min-h-screen bg-slate-50 pb-20 pt-16">
          <TopBar />
          {children}
          <Navigation />
          <NotificationToast />
      </div>
  );

  if (currentView === AppView.DASHBOARD) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto p-6 flex flex-col items-center">
            {/* Badges Section */}
            <div className="w-full mb-6 flex gap-3 overflow-x-auto py-2 no-scrollbar">
                {userProfile?.badges.map(badge => (
                    <div key={badge.id} className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${badge.unlocked ? 'bg-white border-yellow-400 shadow-md' : 'bg-slate-100 border-slate-200 grayscale opacity-50'}`} title={badge.name}>
                        {badge.icon}
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full text-center">
                <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('readyToLearn', language)}</h1>
                <p className="text-slate-500 mb-8">
                    {userProfile?.level} • {userProfile?.customKeywords || userProfile?.interests[0] || 'General'}
                </p>
                <Button onClick={startLearningSession} className="w-full text-lg py-4 shadow-xl shadow-brand-500/20">
                    {t('generateNew', language)}
                </Button>
            </div>
            <button 
                onClick={() => setCurrentView(AppView.ONBOARDING)} 
                className="mt-6 text-sm text-slate-400 hover:text-brand-600 transition-colors"
            >
                {t('adjustProfile', language)}
            </button>
        </div>
      </MainLayout>
    );
  }

  if (currentView === AppView.FORUM) {
      return (
          <MainLayout>
              <ForumView posts={posts} onAddPost={handleAddPost} lang={language} />
          </MainLayout>
      );
  }

  if (currentView === AppView.READING && article) {
    return (
        <MainLayout>
            <ReadingView article={article} onFinish={handleFinishReading} lang={language} />
        </MainLayout>
    );
  }

  if (currentView === AppView.QUIZ) {
    return (
        <MainLayout>
            <QuizView questions={questions} onComplete={handleQuizComplete} lang={language} />
        </MainLayout>
    );
  }

  if (currentView === AppView.REPORT) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                <div className="mb-6">
                    {quizScore === questions.length ? (
                        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto text-4xl">🏆</div>
                    ) : (
                        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto text-4xl">✨</div>
                    )}
                </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Complete!</h2>
            <p className="text-slate-500 mb-8">You learned {article?.vocabulary.length} new words.</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <div className="text-sm text-slate-400 uppercase tracking-wide font-bold mb-1">{t('score', language)}</div>
                <div className="text-4xl font-black text-slate-900">
                    {quizScore} <span className="text-xl text-slate-400 font-medium">/ {questions.length}</span>
                </div>
            </div>

            <div className="space-y-3">
                <Button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-full">
                    {t('backDashboard', language)}
                </Button>
                <Button variant="ghost" onClick={startLearningSession} className="w-full">
                    {t('nextLesson', language)}
                </Button>
            </div>
            </div>
        </div>
      </MainLayout>
    );
  }

  return <div>Error: Unknown State</div>;
};

export default App;
