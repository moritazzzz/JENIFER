import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Child, type Session, type Difficulty, type ChatMessage } from '../../types';
import { WORLDS } from '../../constants';
import { Mic, MicOff, Star, Trophy, X, Check, Volume2, Timer, Info, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Assistant } from '../chatbot/Assistant';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { generateSessionActivities, type GeneratedActivity } from '../../services/geminiService';

interface ActivityProps {
  child: Child;
  difficulty?: Difficulty;
  onFinish: (session: Session) => void;
  onCancel: () => void;
}

// Simple Web Speech API wrapper
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function Activity({ child, difficulty, onFinish, onCancel }: ActivityProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'retry' | null>(null);
  const [sessionActivities, setSessionActivities] = useState<GeneratedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [stars, setStars] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(child.sessionDuration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionChat, setSessionChat] = useState<ChatMessage[]>([]);
  const initializedRef = useRef(false);

  const activeDifficulty = difficulty || child.difficulty;
  const world = WORLDS[activeDifficulty];
  
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const aiActivities = await generateSessionActivities(activeDifficulty);
        if (aiActivities && aiActivities.length > 0) {
          setSessionActivities(aiActivities);
        } else {
          // Fallback to static pool
          const pool = [...world.activities];
          const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
          setSessionActivities(shuffled as any);
        }
      } catch (err) {
        // Fallback to static pool
        const pool = [...world.activities];
        const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
        setSessionActivities(shuffled as any);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [activeDifficulty, world.activities]);

  const currentActivity = sessionActivities[currentStep];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const playSound = (type: 'success' | 'retry') => {
    const urls = {
      success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      retry: 'https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3'
    };
    const audio = new Audio(urls[type]);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Auto-play blocked or sound failed', e));
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Lo siento, tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.");
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.log('Speech recognition error', event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscription(result);
      validateResult(result);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition', e);
    }
  };

  const speakActivity = (autoListen: boolean = true) => {
    if (!window.speechSynthesis || !currentActivity) return;
    window.speechSynthesis.cancel();
    
    const text = currentActivity.instruction || 
      (activeDifficulty === 'easy' 
        ? `Escucha y repite: ${currentActivity.word}` 
        : `¿Qué es esto? Di su nombre en voz alta.`);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; 
    utterance.pitch = 1.1;
    
    utterance.onend = () => {
      if (autoListen && !isFinished) {
        // Short delay before listening to avoid picking up the synthesised voice
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!currentActivity) return;
    // Speak automatically on step change
    const timer = setTimeout(() => {
      speakActivity();
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep, currentActivity]);

  const validateOption = (selected: string) => {
    if (!currentActivity) return;
    if (selected.toLowerCase() === currentActivity.word.toLowerCase()) {
      handleSuccess();
    } else {
      handleRetry();
    }
  };

  const [completedWord, setCompletedWord] = useState<string[]>([]);
  
  useEffect(() => {
    if (activeDifficulty === 'hard' && currentActivity) {
      // Initialize completed word slots based on currentActivity.displayChallenge or word
      const initial = currentActivity.displayChallenge 
        ? currentActivity.displayChallenge.split('').map(c => c === '_' ? '' : c)
        : currentActivity.word.split('').map(() => '');
      setCompletedWord(initial);
    }
  }, [currentActivity, activeDifficulty]);

  const addLetter = (letter: string) => {
    // Speak the letter for phonetic reinforcement
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'es-ES';
      utterance.rate = 0.6; // Clear and slow
      window.speechSynthesis.speak(utterance);
    }

    const nextIndex = completedWord.indexOf('');
    if (nextIndex !== -1) {
      const newWord = [...completedWord];
      newWord[nextIndex] = letter;
      setCompletedWord(newWord);
      
      if (newWord.join('').toLowerCase() === currentActivity.word.toLowerCase()) {
        handleSuccess();
      } else if (!newWord.includes('')) {
        // If filled but wrong
        handleRetry();
        setTimeout(() => {
          const reset = currentActivity.displayChallenge 
            ? currentActivity.displayChallenge.split('').map(c => c === '_' ? '' : c)
            : currentActivity.word.split('').map(() => '');
          setCompletedWord(reset);
        }, 2000);
      }
    }
  };

  const validateResult = (text: string) => {
    if (!currentActivity) return;
    const target = currentActivity.word.toLowerCase();
    const spoken = text.toLowerCase();
    
    // Looser validation for kids
    const isCorrect = spoken.includes(target) || target.split(' ').every(word => spoken.includes(word));

    if (isCorrect) {
      handleSuccess();
    } else {
      handleRetry();
    }
  };

  const handleSuccess = () => {
    if (!currentActivity) return;
    setFeedback('success');
    setPoints(prev => prev + currentActivity.points);
    setStars(prev => prev + 1);
    setCorrectCount(prev => prev + 1);
    
    playSound('success');

    // Verbal praise with motivational ending
    if (window.speechSynthesis) {
      const phrases = [
        "¡Excelente! Lo has dicho perfecto.",
        "¡Muy bien! Esa es la palabra correcta.",
        "¡Increíble! Tu pronunciación es genial.",
        "¡Bravo! Vamos al siguiente desafío.",
        "¡Estás mejorando muchísimo!"
      ];
      const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
      const utterance = new SpeechSynthesisUtterance(randomMsg);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.6 },
      colors: ['#4ade80', '#22c55e', '#fbbf24'] 
    });

    setTimeout(() => {
      setFeedback(null);
      setTranscription('');
      if (currentStep < sessionActivities.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        finishSession();
      }
    }, 2500);
  };

  const handleRetry = () => {
    if (!currentActivity) return;
    setFeedback('retry');
    playSound('retry');
    
    if (window.speechSynthesis) {
      const word = currentActivity.word;
      const tip = currentActivity.pronunciationTip;
      
      const phrases = [
        `Casi, casi lo tienes. Intenta de nuevo. Recuerda que se dice: ${word}.`,
        `Buen intento, pero escúchame bien: ${word}. ¿Puedes repetirlo?`,
        `¡Oh! Estuvimos cerca. Prueba decir: ${word} otra vez.`
      ];
      const baseMsg = phrases[Math.floor(Math.random() * phrases.length)];
      const msg = tip ? `${baseMsg} Un truquito: ${tip}` : baseMsg;
      
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'es-ES';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }

    // Don't advance, wait for them to try again
    setTimeout(() => {
      setFeedback(null);
      setTranscription('');
    }, 4500);
  };

  const finishSession = async () => {
    if (isFinished) return;
    setIsFinished(true);

    const sessionId = crypto.randomUUID();
    const session: Session = {
      id: sessionId,
      childId: child.id,
      therapistId: child.therapistId,
      date: new Date().toISOString(),
      levelReached: currentStep >= sessionActivities.length - 1 ? 'Completo' : `Paso ${currentStep + 1}`,
      difficultyWorked: activeDifficulty,
      correctCount,
      incorrectCount: (currentStep + 1) - correctCount,
      totalWords: currentStep + 1,
      pointsEarned: points,
      starsEarned: stars,
      timeSpent: (child.sessionDuration * 60) - timeRemaining,
      chatHistory: sessionChat.map(m => ({ ...m, timestamp: new Date().toISOString() }))
    };

    try {
      const sessionPath = `children/${child.id}/sessions`;
      
      const updates: any = {
        points: increment(points),
        stars: increment(stars),
        lastSessionAt: new Date().toISOString()
      };

      // Progression Logic: Auto-advance difficulty
      const newTotalPoints = (child.points || 0) + points;
      if (activeDifficulty === 'easy' && newTotalPoints >= 100) {
        updates.difficulty = 'medium';
      } else if (activeDifficulty === 'medium' && newTotalPoints >= 300) {
        updates.difficulty = 'hard';
      }

      await addDoc(collection(db, sessionPath), session);
      await updateDoc(doc(db, 'children', child.id), updates);
      onFinish(session);
    } catch (error) {
      handleFirestoreError(error, 'write', `children/${child.id}/sessions and profile`);
      onFinish(session);
    }
  };

  function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore ErrorDetailed: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-blue-50 flex flex-col items-center justify-center p-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 border-b-8 border-gray-100"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-7xl text-blue-500"
            >
              <Loader2 className="w-20 h-20 animate-spin" />
            </motion.div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight italic mb-2">
              ¡Preparando tu aventura mágica!
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              La IA está buscando palabras nuevas para ti...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-full bg-gray-50 flex flex-col p-6 md:p-10 relative overflow-y-auto custom-scrollbar transition-all duration-500",
      isListening && "ring-[20px] ring-red-500/10 bg-red-50/30"
    )}>
      <AnimatePresence>
        {feedback === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-green-500 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center border-b-8 border-green-700">
              <Check className="w-24 h-24 mb-4" />
              <span className="text-4xl font-black tracking-tighter uppercase italic">¡LO LOGRASTE!</span>
              <p className="text-green-100 font-bold mt-2">+ {currentActivity?.points} puntos</p>
            </div>
          </motion.div>
        )}

        {feedback === 'retry' && (
           <motion.div 
           initial={{ opacity: 0, y: 50 }} 
           animate={{ opacity: 1, y: 0 }} 
           exit={{ opacity: 0, y: 50 }}
           className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm"
         >
           <div className="bg-orange-500 text-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-8 border-orange-700">
             <div className="bg-white/20 p-3 rounded-2xl">
               <Volume2 className="w-8 h-8" />
             </div>
             <div>
               <p className="font-black text-xl italic leading-tight uppercase">¡Casi! Intenta de nuevo</p>
               <p className="text-orange-100 text-sm font-bold opacity-90">Respira y dilo otra vez</p>
             </div>
           </div>
         </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto w-full flex flex-col flex-1 gap-12 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border-4 border-white shadow-xl w-full md:w-auto">
            <div className="w-14 h-14 bg-orange-400 rounded-full border-4 border-white shadow-inner flex items-center justify-center text-3xl">
               {child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-orange-600 tracking-tight leading-none uppercase">{child.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full md:w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                   <motion.div 
                      className="h-full bg-green-400" 
                      animate={{ width: `${((currentStep + 1) / (sessionActivities.length || 5)) * 100}%` }} 
                   />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">{currentStep + 1}/{sessionActivities.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto justify-center">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border-4 border-white shadow-lg">
               <Timer className="w-5 h-5 text-red-500" />
               <span className="text-xl font-black text-slate-700">{formatTime(timeRemaining)}</span>
            </div>
            <button 
              onClick={onCancel}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border-4 border-white shadow-xl text-slate-500 font-bold hover:text-red-500 transition-colors hover:scale-105 active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors" />
              <span className="uppercase text-sm tracking-widest font-black italic">Volver</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="text-center mb-12">
             <p className="text-sm font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">{world.name}</p>
             <h2 className="text-4xl font-black text-gray-800 italic">{world.description}</h2>
          </div>

          <div className="flex flex-col items-center max-w-2xl w-full">
            {currentActivity && (
             <motion.div 
               key={currentStep}
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className="w-full bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-blue-100 border-b-8 border-gray-100 flex flex-col items-center"
             >
               {activeDifficulty === 'easy' && (
                <div className="text-center space-y-8">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} 
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-[10rem] leading-none mb-8 filter drop-shadow-2xl"
                  >
                    {currentActivity.image || "📢"}
                  </motion.div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-blue-400 uppercase tracking-tighter">Escucha y Repite</h3>
                    <div className="flex items-center justify-center gap-6">
                      <button 
                        onClick={() => speakActivity()}
                        className="bg-blue-100 p-6 rounded-[2rem] text-blue-600 hover:bg-blue-200 transition-all group shadow-inner"
                      >
                        <Volume2 className="w-14 h-14 group-hover:scale-110 transition-transform" />
                      </button>
                      <p className="text-8xl font-black text-blue-600 tracking-tighter lowercase">
                        "{currentActivity.word}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeDifficulty === 'medium' && (
                <div className="text-center space-y-10 w-full">
                  <div className="space-y-4">
                    <motion.div 
                      key={currentActivity.image}
                      initial={{ scale: 0.5, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="text-[10rem] leading-none mb-4 filter drop-shadow-2xl"
                    >
                      {currentActivity.image}
                    </motion.div>
                    <h3 className="text-3xl font-black text-gray-800 tracking-tight italic">
                      ¿Qué ves en la imagen?
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {currentActivity.options?.map((opt, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => validateOption(opt)}
                        className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 p-6 rounded-[2rem] border-b-4 border-blue-200 font-black text-2xl transition-colors shadow-lg shadow-blue-100/50"
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                  
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    O usa el micrófono para decirlo
                  </p>
                </div>
              )}

              {activeDifficulty === 'hard' && (
                <div className="text-center space-y-12 w-full">
                   <div className="flex flex-col items-center gap-10">
                      {currentActivity.image && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-9xl filter drop-shadow-xl mb-4"
                        >
                          {currentActivity.image}
                        </motion.div>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {completedWord.map((char, i) => (
                          <motion.div 
                            key={i} 
                            animate={char ? { scale: [1, 1.2, 1] } : {}}
                            className={cn(
                              "w-14 h-16 rounded-2xl flex items-center justify-center text-4xl font-black transition-all",
                              char 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                                : "bg-white border-4 border-dashed border-gray-200 text-gray-200"
                            )}
                          >
                            {char || '?'}
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex flex-wrap justify-center gap-3">
                          {currentActivity.word.split('').sort(() => Math.random() - 0.5).map((char, i) => (
                            <motion.button
                              key={i}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addLetter(char)}
                              className="w-14 h-14 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center text-2xl font-black text-gray-700 shadow hover:border-blue-400 hover:text-blue-600 transition-all uppercase"
                            >
                              {char}
                            </motion.button>
                          ))}
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                          Pulsa las letras o di la palabra completa
                        </p>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
            )}

           <div className="mt-12 flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startListening}
                className={cn(
                  "p-10 rounded-full shadow-2xl transition-all relative overflow-hidden",
                  isListening ? "bg-red-500 scale-110 ring-8 ring-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                )}
              >
                {isListening ? <Mic className="w-12 h-12 text-white animate-pulse" /> : <Mic className="w-12 h-12 text-white" />}
                {isListening && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-white rounded-full"
                  />
                )}
              </motion.button>
              <p className={cn("text-lg font-bold uppercase tracking-widest", isListening ? "text-red-500" : "text-gray-400")}>
                {isListening ? "¡Habla ahora!" : "Presiona para hablar"}
              </p>
              {transcription && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-gray-100 px-6 py-2 rounded-full font-medium text-gray-600 italic">
                   Dijiste: "{transcription}"
                </motion.p>
              )}
           </div>
        </div>
      </main>
      </div>

      <Assistant 
        childId={child.id}
        childName={child.name} 
        performance={correctCount > currentStep ? 'excelente' : 'bueno'} 
        isVisible={true}
        onMessagesChange={setSessionChat}
      />

      {/* Decorative worlds icons in background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <motion.span 
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] text-9xl"
        >🌿</motion.span>
        <motion.span 
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[10%] text-8xl"
        >🐦</motion.span>
        <motion.span 
          animate={{ scale: [1, 1.2, 1], rotate: 45 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[15%] left-[15%] text-7xl"
        >⭐</motion.span>
        <motion.span 
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[20%] right-[20%] text-9xl"
        >☁️</motion.span>
        <motion.span 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[40%] text-5xl opacity-30"
        >✨</motion.span>
      </div>
    </div>
  );
}
