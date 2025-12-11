
import React, { useState, useEffect } from 'react';
import { generateCurriculum, generateQuiz } from './services/geminiService';
import { fetchYouTubeVideo } from './services/youtubeService';
import { Curriculum, Module, UserState, LEVELS, Quiz, VideoResource } from './types';
import { 
  BookOpen, CheckCircle, 
  PlayCircle, BrainCircuit, 
  Flame, ChevronRight, 
  ChevronDown, ExternalLink,
  Award, Github, Briefcase,
  X, Settings, Key, LogOut, Youtube
} from './components/Icons';

// --- Helper Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    ></div>
  </div>
);

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up">
    <CheckCircle size={20} className="text-green-400" />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:text-gray-300">
      <X size={16} />
    </button>
  </div>
);

const LoadingView = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing Skill Architecture...",
    "Identifying Core Concepts...",
    "Curating High-Quality Video Sources...",
    "Fetching Live YouTube Data...",
    "Finalizing Curriculum..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <BrainCircuit className="text-blue-600 w-8 h-8 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Building Your Path</h2>
      
      <div className="flex flex-col items-center space-y-3">
        {steps.map((text, idx) => (
          <div 
            key={idx} 
            className={`transition-all duration-500 flex items-center gap-3 ${
              idx === step 
                ? 'opacity-100 transform scale-105 font-medium text-blue-600' 
                : idx < step 
                  ? 'opacity-40 text-slate-400' 
                  : 'opacity-20 text-slate-300'
            }`}
          >
            {idx < step ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizLoadingView = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Analyzing content...",
    "Generating challenge questions...",
    "Verifying answer keys...",
    "Finalizing quiz..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev < messages.length - 1 ? prev + 1 : 0));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-12 flex flex-col items-center justify-center space-y-6 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <Award className="text-purple-600 w-6 h-6 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold text-slate-800">Preparing Quiz</p>
        <p className="text-slate-500 text-sm mt-1 animate-pulse">{messages[msgIndex]}</p>
      </div>
    </div>
  );
};

// --- Settings Modal ---

interface SettingsModalProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  ytApiKey: string;
  setYtApiKey: (key: string) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ apiKey, setApiKey, ytApiKey, setYtApiKey, onClose }) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputYtKey, setInputYtKey] = useState(ytApiKey);
  const [activeTab, setActiveTab] = useState<'gemini' | 'youtube'>('gemini');

  const handleSave = () => {
    setApiKey(inputKey);
    localStorage.setItem('gemini_api_key', inputKey);
    
    setYtApiKey(inputYtKey);
    localStorage.setItem('youtube_api_key', inputYtKey);
    
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    
    setInputYtKey('');
    setYtApiKey('');
    localStorage.removeItem('youtube_api_key');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
            <Settings className="text-blue-600" /> Settings
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('gemini')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'gemini' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <BrainCircuit size={16} /> Gemini API
            </button>
            <button 
              onClick={() => setActiveTab('youtube')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'youtube' ? 'bg-red-100 text-red-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Youtube size={16} /> YouTube API
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium">Cancel</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'gemini' ? 'Configure Gemini AI' : 'Configure YouTube Data'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 md:hidden">
              <X size={20} />
            </button>
          </div>

          {activeTab === 'gemini' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <ExternalLink size={14} /> How to get a key
                </h4>
                <p className="text-blue-700 mb-3">
                  You can get a free API key from Google's AI Studio. It allows the app to generate the curriculum and quizzes.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-white text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 font-medium transition-colors"
                >
                  Get API Key <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Data API Key</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    value={inputYtKey}
                    onChange={(e) => setInputYtKey(e.target.value)}
                    placeholder="Enter YouTube API Key"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <ExternalLink size={14} /> How to get a key
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-orange-800 marker:font-bold">
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" className="underline font-medium hover:text-orange-900">Google Cloud Console</a>.</li>
                  <li>Create a new Project (or select an existing one).</li>
                  <li>Search for and enable <strong>"YouTube Data API v3"</strong> in the Library.</li>
                  <li>Go to <strong>Credentials</strong> and create a new <strong>API Key</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="pt-8 flex gap-3">
             <button 
              onClick={handleSave}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-slate-200"
            >
              Save & Close
            </button>
            {(apiKey || ytApiKey) && (
              <button 
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                title="Clear all keys"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

interface ModuleCardProps {
  module: Module;
  index: number;
  isCompleted: boolean;
  completedVideoIds: string[];
  onStartModuleQuiz: () => void;
  onStartVideoQuiz: (video: VideoResource) => void;
  onOpenNotebookLM: (url: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  index, 
  isCompleted, 
  completedVideoIds,
  onStartModuleQuiz,
  onStartVideoQuiz,
  onOpenNotebookLM
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const getUrl = (video: VideoResource) => {
    if (video.videoId) {
      return `https://www.youtube.com/watch?v=${video.videoId}`;
    }
    const query = video.searchQuery || video.title;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  return (
    <div className={`bg-white rounded-xl border ${isCompleted ? 'border-green-200 shadow-sm' : 'border-slate-200 shadow-sm'} overflow-hidden transition-all`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            {isCompleted ? <CheckCircle size={20} /> : index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{module.level}</span>
              {isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full font-medium">Completed</span>}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
          
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learning Goals</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                {module.learningGoals.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {module.keyConcepts.map((c, i) => (
                  <span key={i} className="bg-white border px-2 py-1 rounded text-xs font-medium text-slate-600 shadow-sm">{c}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              Curated Video Content
            </h4>
            {module.videos.map((video, i) => {
              const url = getUrl(video);
              const isVideoVerified = video.videoId ? completedVideoIds.includes(video.videoId) : false;

              return (
                <div key={i} className={`bg-white p-4 rounded-lg border ${isVideoVerified ? 'border-green-200 bg-green-50/30' : 'border-slate-200'} transition-all hover:shadow-md flex flex-col sm:flex-row gap-4`}>
                  
                  {/* Thumbnail / Video Preview */}
                  {video.thumbnailUrl ? (
                    <div className="relative w-full sm:w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 group cursor-pointer" onClick={() => window.open(url, '_blank')}>
                       <img src={video.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                          <PlayCircle className="text-white opacity-80 group-hover:opacity-100" size={32} />
                       </div>
                    </div>
                  ) : (
                    <div className="w-full sm:w-40 h-24 flex-shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200" onClick={() => window.open(url, '_blank')}>
                      <Youtube size={32} />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {video.videoTitle || video.title}
                      </a>
                      <p className="text-xs text-slate-500 mt-1">{video.channelTitle || video.searchQuery} {video.duration && `• ${video.duration}`}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{video.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <button 
                        onClick={() => onStartVideoQuiz(video)}
                        disabled={isVideoVerified}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md border transition-colors
                          ${isVideoVerified 
                            ? 'bg-green-100 text-green-700 border-green-200 cursor-default' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                      >
                        {isVideoVerified ? <CheckCircle size={14} /> : <BrainCircuit size={14} />}
                        {isVideoVerified ? 'Verified' : 'Verify Knowledge'}
                      </button>

                      <button 
                        onClick={() => onOpenNotebookLM(url)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
                      >
                        <BookOpen size={14} />
                        NotebookLM
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
             <div className="text-xs text-slate-400 italic">
               *Master the full module
             </div>
             <button 
                onClick={onStartModuleQuiz}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all
                  ${isCompleted 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 hover:shadow-md active:scale-95'}`}
             >
               {isCompleted ? (
                 <>
                   <Award size={18} /> Module Mastered
                 </>
               ) : (
                 <>
                   <BrainCircuit size={18} /> Final Module Quiz
                 </>
               )}
             </button>
          </div>

        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  
  // Auth
  const [apiKey, setApiKey] = useState<string>('');
  const [ytApiKey, setYtApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quiz
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Progress
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('aiSkillAcceleratorUser');
    if (saved) return JSON.parse(saved);
    return {
      xp: 0,
      level: 1,
      badges: [],
      completedModuleIds: [],
      completedVideoIds: [],
      quizzesTaken: 0,
      streakDays: 1,
      lastLoginDate: new Date().toISOString().split('T')[0]
    };
  });

  // Init Keys
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
    else if (process.env.API_KEY) setApiKey(process.env.API_KEY);

    const storedYtKey = localStorage.getItem('youtube_api_key');
    if (storedYtKey) setYtApiKey(storedYtKey);
  }, []);

  // Save Progress
  useEffect(() => {
    localStorage.setItem('aiSkillAcceleratorUser', JSON.stringify(userState));
  }, [userState]);

  // Generate Curriculum & Hydrate with YouTube
  const handleGenerate = async () => {
    if (!skillInput.trim()) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await generateCurriculum(skillInput, apiKey);
      
      // Initial set (optimistic UI)
      setCurriculum(data);

      // Hydrate with YouTube Data if Key exists
      if (ytApiKey) {
        // We do this async in the background to not block the UI completely, 
        // or we can block if we want to ensure thumbnails load instantly.
        // Let's block slightly to prevent "flash of content"
        const updatedModules = await Promise.all(data.modules.map(async (mod) => {
          const updatedVideos = await Promise.all(mod.videos.map(async (vid) => {
            const searchQuery = vid.searchQuery || `${vid.title} ${mod.title}`;
            const ytData = await fetchYouTubeVideo(searchQuery, ytApiKey);
            return ytData ? { ...vid, ...ytData } : vid;
          }));
          return { ...mod, videos: updatedVideos };
        }));
        
        setCurriculum({ ...data, modules: updatedModules });
      }

    } catch (error) {
      console.error(error);
      alert("Failed to generate. Please check your API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const addXP = (amount: number) => {
    setUserState(prev => {
      const newXP = prev.xp + amount;
      let newLevel = prev.level;
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (newXP >= LEVELS[i].xp) {
          newLevel = LEVELS[i].level;
          break;
        }
      }
      
      const newBadges = [...prev.badges];
      if (newLevel > prev.level) {
        const levelBadge = LEVELS.find(l => l.level === newLevel)?.title;
        if (levelBadge && !newBadges.includes(levelBadge)) {
          newBadges.push(levelBadge);
        }
      }

      return { ...prev, xp: newXP, level: newLevel, badges: newBadges };
    });
  };

  // --- Quizzes ---

  const startModuleQuiz = async (module: Module) => {
    if (!apiKey) return setShowSettings(true);
    setQuizLoading(true);
    setQuizModalOpen(true);
    try {
      const quiz = await generateQuiz('module', module, apiKey);
      setActiveQuiz(quiz);
      resetQuizState();
    } catch (e) {
      console.error(e);
      setQuizModalOpen(false);
      alert("Quiz generation failed.");
    } finally {
      setQuizLoading(false);
    }
  };

  const startVideoQuiz = async (video: VideoResource) => {
    if (!apiKey) return setShowSettings(true);
    setQuizLoading(true);
    setQuizModalOpen(true);
    try {
      const quiz = await generateQuiz('video', video, apiKey);
      setActiveQuiz(quiz);
      resetQuizState();
    } catch (e) {
      console.error(e);
      setQuizModalOpen(false);
      alert("Quiz generation failed.");
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (showExplanation || !activeQuiz) return;
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    
    if (optionIndex === activeQuiz.questions[currentQuestionIndex].correctAnswerIndex) {
      setQuizScore(prev => prev + 1);
      addXP(10); // Small XP per question
    }
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Quiz Finished
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!activeQuiz) return;
    const passed = quizScore >= Math.ceil(activeQuiz.questions.length * 0.6); // 60% to pass
    
    setUserState(prev => ({ ...prev, quizzesTaken: prev.quizzesTaken + 1 }));

    if (passed) {
      // Check if it's a video or module quiz
      if (activeQuiz.title.startsWith("Video")) {
         // Mark video as verified
         if (activeQuiz.contextId !== 'temp') {
             setUserState(prev => ({
               ...prev,
               completedVideoIds: [...prev.completedVideoIds, activeQuiz.contextId]
             }));
         }
         addXP(50);
         setToastMessage("Video Verified! +50 XP");
      } else {
         // Mark module completed
         if (activeQuiz.contextId !== 'temp') {
           setUserState(prev => ({
             ...prev,
             completedModuleIds: [...prev.completedModuleIds, activeQuiz.contextId]
           }));
         }
         addXP(150);
         setToastMessage("Module Mastered! +150 XP");
      }
    } else {
      setToastMessage("Keep learning and try again!");
    }
    
    setTimeout(() => {
      setQuizModalOpen(false);
      setToastMessage(null);
    }, 2500);
  };

  const openNotebookLM = (videoUrl: string) => {
    navigator.clipboard.writeText(videoUrl).then(() => {
      setToastMessage("Link copied for NotebookLM!");
      setTimeout(() => setToastMessage(null), 3000);
      window.open('https://notebooklm.google.com/', '_blank');
    });
  };

  const currentLevelInfo = LEVELS.find(l => l.level === userState.level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find(l => l.level === userState.level + 1);
  const progressToNextLevel = nextLevelInfo 
    ? ((userState.xp - currentLevelInfo.xp) / (nextLevelInfo.xp - currentLevelInfo.xp)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {showSettings && (
        <SettingsModal 
          apiKey={apiKey} 
          setApiKey={setApiKey} 
          ytApiKey={ytApiKey}
          setYtApiKey={setYtApiKey}
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurriculum(null)}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <span className="font-semibold text-lg hidden sm:block">Skill Accelerator</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-orange-500 font-medium" title="Streak">
              <Flame size={20} fill="currentColor" />
              <span>{userState.streakDays}</span>
            </div>
            
            <div className="flex flex-col w-28 sm:w-48">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Lvl {userState.level} {currentLevelInfo.title}</span>
                <span className="text-slate-500">{userState.xp} XP</span>
              </div>
              <ProgressBar progress={progressToNextLevel} />
            </div>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <Settings size={20} />
              {(!apiKey || !ytApiKey) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        
        {/* Intro */}
        {!curriculum && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-full">
              <BrainCircuit className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Master Any Skill with AI & YouTube
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Turn any topic into a structured curriculum with real, verified YouTube videos and AI-generated quizzes.
            </p>
            
            <div className="w-full max-w-lg relative">
              <input 
                type="text" 
                className="w-full pl-6 pr-32 py-4 rounded-xl border border-slate-300 shadow-sm text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                placeholder="What do you want to learn? (e.g., Python, Piano)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg transition-colors"
              >
                Start
              </button>
            </div>
            
            {(!apiKey || !ytApiKey) && (
               <div className="flex gap-2">
                 {!apiKey && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Missing Gemini Key</span>}
                 {!ytApiKey && <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">Missing YouTube Key</span>}
               </div>
            )}
          </div>
        )}

        {isLoading && <LoadingView />}

        {curriculum && !isLoading && (
          <div className="space-y-12 animate-slide-up">
            
            <div className="flex items-center justify-between border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{curriculum.skillName}</h1>
                <p className="text-slate-500 mt-1">Structured Learning Path</p>
              </div>
              <button onClick={() => setCurriculum(null)} className="text-sm text-slate-500 hover:text-slate-800 underline">Generate New</button>
            </div>

            <div className="space-y-6">
              {curriculum.modules.map((module, index) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  index={index}
                  isCompleted={userState.completedModuleIds.includes(module.id)}
                  completedVideoIds={userState.completedVideoIds}
                  onStartModuleQuiz={() => startModuleQuiz(module)}
                  onStartVideoQuiz={startVideoQuiz}
                  onOpenNotebookLM={openNotebookLM}
                />
              ))}
            </div>

            {/* Career */}
            <div className="bg-slate-900 text-slate-50 rounded-2xl p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                <Briefcase className="text-blue-400" />
                <h2 className="text-2xl font-bold">Career Integration</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2"><Github size={18} /> Projects</h3>
                  <ul className="space-y-3">
                    {curriculum.career.projectIdeas.map((idea, i) => (
                      <li key={i} className="flex gap-2 text-slate-300 text-sm"><span className="text-blue-500">•</span> {idea}</li>
                    ))}
                  </ul>
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-blue-300 mb-4">Resume</h3>
                   <div className="flex flex-wrap gap-2">
                     {curriculum.career.resumeBullets.map((bullet, i) => (
                       <span key={i} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">{bullet}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {quizLoading ? (
              <QuizLoadingView />
            ) : activeQuiz ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold truncate pr-4">{activeQuiz.title}</h3>
                  <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-slate-600">Close</button>
                </div>
                
                <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
                   <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}></div>
                </div>

                <div className="mb-6 min-h-[80px]">
                  <p className="text-lg font-medium text-slate-800">{activeQuiz.questions[currentQuestionIndex].question}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                    if (selectedOption === null) {
                      btnClass += "border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-600";
                    } else if (idx === activeQuiz.questions[currentQuestionIndex].correctAnswerIndex) {
                      btnClass += "border-green-500 bg-green-50 text-green-700";
                    } else if (idx === selectedOption) {
                      btnClass += "border-red-500 bg-red-50 text-red-700";
                    } else {
                      btnClass += "border-slate-100 opacity-40";
                    }
                    return (
                      <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={selectedOption !== null} className={btnClass}>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="space-y-4 animate-fade-in">
                     <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-blue-800"><span className="font-bold">Explanation:</span> {activeQuiz.questions[currentQuestionIndex].explanation}</p>
                    </div>
                    <button onClick={nextQuestion} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                      {currentQuestionIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
