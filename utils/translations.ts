import { Language } from '../types';

type TranslationKey = 
  | 'welcome' | 'subtitle' | 'chooseLevel' | 'interests' | 'customTopics'
  | 'nextStep' | 'startJourney' | 'generating' | 'readyToLearn'
  | 'generateNew' | 'adjustProfile' | 'finishReading' | 'quiz' 
  | 'score' | 'backDashboard' | 'nextLesson' | 'forum' | 'home' 
  | 'profile' | 'points' | 'streak' | 'posts' | 'newPost' | 'submit';

const dictionary: Record<Language, Record<TranslationKey, string>> = {
  en: {
    welcome: "Readlingua",
    subtitle: "Your personalized path to English mastery.",
    chooseLevel: "Choose your level",
    interests: "What interests you?",
    customTopics: "Custom Topics (Optional)",
    nextStep: "Next Step",
    startJourney: "Start Journey",
    generating: "AI is crafting your personalized article...",
    readyToLearn: "Ready to Learn?",
    generateNew: "Generate New Lesson",
    adjustProfile: "Adjust Level & Interests",
    finishReading: "Finish Reading & Start Quiz",
    quiz: "Quiz",
    score: "Quiz Score",
    backDashboard: "Back to Dashboard",
    nextLesson: "Start Next Lesson",
    forum: "Community Forum",
    home: "Home",
    profile: "Profile",
    points: "Points",
    streak: "Day Streak",
    posts: "Discussions",
    newPost: "New Post",
    submit: "Submit",
  },
  zh: {
    welcome: "阅途 Readlingua",
    subtitle: "您的个性化英语进阶之路。",
    chooseLevel: "选择您的英语水平",
    interests: "您感兴趣的话题?",
    customTopics: "自定义关键词 (选填)",
    nextStep: "下一步",
    startJourney: "开始旅程",
    generating: "AI 正在为您生成专属文章...",
    readyToLearn: "准备好学习了吗?",
    generateNew: "生成新课程",
    adjustProfile: "调整水平和兴趣",
    finishReading: "完成阅读并开始测试",
    quiz: "理解测试",
    score: "测试得分",
    backDashboard: "返回主页",
    nextLesson: "开始下一课",
    forum: "学习社区",
    home: "首页",
    profile: "个人中心",
    points: "积分",
    streak: "天连胜",
    posts: "讨论区",
    newPost: "发布新帖",
    submit: "提交",
  }
};

export const t = (key: TranslationKey, lang: Language): string => {
  return dictionary[lang][key] || key;
};
