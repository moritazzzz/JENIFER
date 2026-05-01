import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Child, type Session, type Difficulty, type ChatMessage } from '../../types';
import { WORLDS } from '../../constants';
import { Mic, MicOff, Star, Trophy, X, Check, Volume2, Timer, Info, ArrowLeft } from 'lucide-react';
import { Assistant } from '../chatbot/Assistant';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

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
  const [points, setPoints] = useState(0);
  const [stars, setStars] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(child.sessionDuration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionChat, setSessionChat] = useState<ChatMessage[]>([]);

  const activeDifficulty = difficulty || child.difficulty;
  const world = WORLDS[activeDifficulty];
  const activities = world.activities;
  const currentActivity = activities[currentStep];

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

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Lo siento, tu navegador no soporta reconocimiento de voz. ¡Usaremos el teclado por ahora!");
      simulateSpeech();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscription(result);
      validateResult(result);
    };

    recognition.start();
  };

  const simulateSpeech = () => {
    // For demo/unsupported browsers
    setTimeout(() => {
      const result = currentActivity.word;
      setTranscription(result);
      validateResult(result);
    }, 2000);
  };
  const speakActivity = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const word = currentActivity.word;
    const syllables = (currentActivity as any).syllables || word;
    
    let text = "";
    if (activeDifficulty === 'easy') {
      text = `Escucha con atención: ${syllables}. Ahora dilo conmigo: ${word}.`;
    } else if (activeDifficulty === 'medium') {
      text = `¿Qué vemos aquí? Es un... ${word}. Digámoslo por sílabas: ${syllables}.`;
    } else {
      text = `Dime esta frase completa: ${word}.`;
    }

    // Add pronunciation tip if available
    const tip = (currentActivity as any).pronunciationTip;
    if (tip) {
      text += ` Un consejito mágico: ${tip}`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.6; // Slower and clearer
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Speak automatically on step change
    const timer = setTimeout(() => {
      speakActivity();
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const validateResult = (text: string) => {
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
    setFeedback('success');
    setPoints(prev => prev + currentActivity.points);
    setStars(prev => prev + 1);
    setCorrectCount(prev => prev + 1);
    
    // Verbal praise
    if (window.speechSynthesis) {
      const phrases = ["¡Increíble!", "¡Lo lograste!", "¡Qué bien hablas!", "¡Súper!", "¡Eres un genio!"];
      const randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
      const utterance = new SpeechSynthesisUtterance(randomMsg);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }

    confetti({ particleCount: 40, spread: 50, colors: ['#4ade80', '#22c55e'] });

    setTimeout(() => {
      setFeedback(null);
      setTranscription('');
      if (currentStep < activities.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        finishSession();
      }
    }, 2000);
  };

  const handleRetry = () => {
    setFeedback('retry');
    
    if (window.speechSynthesis) {
      const word = currentActivity.word;
      const syllables = (currentActivity as any).syllables || word;
      const tip = (currentActivity as any).pronunciationTip;
      
      const msg = `Casi lo tienes. Intentemos decir las sílabas: ${syllables}. Ahora todo junto: ${word}. ${tip || ""}`;
      
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'es-ES';
      utterance.rate = 0.6;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setFeedback(null), 4000);
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
      levelReached: currentStep >= activities.length - 1 ? 'Completo' : `Paso ${currentStep + 1}`,
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
      
      await addDoc(collection(db, sessionPath), session);
      await updateDoc(doc(db, 'children', child.id), {
        points: increment(points),
        stars: increment(stars),
        lastSessionAt: new Date().toISOString()
      });
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

  return (
    <div className="min-h-full bg-gray-50 flex flex-col p-6 md:p-10 relative overflow-y-auto custom-scrollbar">
      <AnimatePresence>
        {feedback === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-green-500 text-white p-10 rounded-full shadow-2xl flex flex-col items-center">
              <Check className="w-20 h-20" />
              <span className="text-2xl font-black mt-2 tracking-tighter uppercase">¡EXCELENTE!</span>
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
                      animate={{ width: `${((currentStep + 1) / activities.length) * 100}%` }} 
                   />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">{currentStep + 1}/{activities.length}</span>
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
             <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-blue-100 border-b-8 border-gray-100 flex flex-col items-center"
             >
              {activeDifficulty === 'easy' && (
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">📢</div>
                  <h3 className="text-3xl font-bold text-gray-400">Escucha y repite:</h3>
                  <div className="flex items-center justify-center gap-4">
                    <button className="bg-blue-100 p-4 rounded-2xl text-blue-600 hover:bg-blue-200 transition-all group">
                      <Volume2 className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    </button>
                    <p className="text-7xl font-black text-blue-600 tracking-tight lowercase">"{currentActivity.word}"</p>
                  </div>
                </div>
              )}

              {activeDifficulty === 'medium' && (
                <div className="text-center space-y-6">
                  <div className="text-9xl mb-4">{(currentActivity as any).image}</div>
                  <h3 className="text-3xl font-bold text-gray-400 italic">¿Qué ves en la imagen?</h3>
                </div>
              )}

              {activeDifficulty === 'hard' && (
                <div className="text-center space-y-6">
                   <div className="flex items-center justify-center gap-2 mb-6">
                      {currentActivity.word.split('').map((char, i) => (
                        <div key={i} className="w-14 h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center text-3xl font-black text-blue-600">
                          _
                        </div>
                      ))}
                   </div>
                   <h3 className="text-3xl font-bold text-gray-400">¡Dilo en voz alta!</h3>
                   <div className="text-sm bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100 flex items-center gap-2 font-medium">
                      <Info className="w-4 h-4" /> Pista: Es un "{currentActivity.word}"
                   </div>
                </div>
              )}
           </motion.div>

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
