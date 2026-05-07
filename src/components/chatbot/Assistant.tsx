import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { type ChatMessage, type LiveCommand } from '../../types';
import { getAssistantResponse } from '../../services/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, onSnapshot, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface AssistantProps {
  childId?: string;
  childName: string;
  performance: string;
  isVisible: boolean;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onAction?: (action: string) => void;
}

// Speech synthesis helper
const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.85; // Slightly faster but still child-friendly
  utterance.pitch = 1.1; 
  window.speechSynthesis.speak(utterance);
};

export function Assistant({ childId, childName, performance, isVisible, onMessagesChange, onAction }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `¡Hola ${childName}! Soy tu Guía Mágico. ¡Estoy aquí para divertirnos juntos!` }
  ]);

  // Speak greeting on mount
  useEffect(() => {
    if (isVisible && messages.length === 1) {
      speak(messages[0].content);
    }
  }, [isVisible]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSparkling, setIsSparkling] = useState(false);

  useEffect(() => {
    if (!childId) return;

    const path = `children/${childId}/liveCommands`;
    const q = query(
      collection(db, path),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const command = change.doc.data() as LiveCommand;
          handleCommand(command, change.doc.id);
        }
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [childId]);

  const handleCommand = async (command: LiveCommand, docId: string) => {
    // Only process commands from last 10 seconds to avoid stale triggers
    const cmdTime = new Date(command.timestamp).getTime();
    if (Date.now() - cmdTime > 10000) return;

    if (command.type === 'message' && command.content) {
      setMessages(prev => [...prev, { role: 'assistant', content: command.content! }]);
      speak(command.content!);
    } else if (command.type === 'confetti') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
      });
      speak("¡Increíble! ¡Mira todos esos colores!");
    } else if (command.type === 'sparkle') {
      setIsSparkling(true);
      setTimeout(() => setIsSparkling(false), 3000);
      speak("¡Magia viva! ¡Qué brillante!");
      onAction?.('sparkle');
    }

    // Cleanup command
    if (childId) {
      const path = `children/${childId}/liveCommands/${docId}`;
      try {
        await deleteDoc(doc(db, `children/${childId}/liveCommands`, docId));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
      }
    }
  };

  // Performance-based feedback removed as it conflicts with Activity.tsx feedback
  // to avoid the "double praise" bug.
  
  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isSparkling ? [1, 1.1, 1] : 1
      }}
      transition={{ 
        scale: { duration: 0.5, repeat: isSparkling ? Infinity : 0 }
      }}
      className="fixed bottom-8 right-8 flex items-end gap-4 z-50 pointer-events-none"
    >
      <div className="bg-white p-5 rounded-3xl rounded-br-none shadow-2xl border-4 border-white max-w-xs relative pointer-events-auto">
        <div className="absolute top-0 right-0 p-2">
           <Sparkles className={cn("w-4 h-4 text-yellow-400 animate-pulse", isSparkling && "scale-150 text-orange-500")} />
        </div>
        <div className="flex flex-col gap-2">
          {messages.slice(-1).map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-slate-700 font-bold text-lg leading-snug"
            >
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </motion.div>
          ))}
          {isTyping && (
             <div className="flex gap-1">
               <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-400 rounded-full" />
               <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
             </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 translate-y-full w-0 h-0 border-l-[20px] border-l-white border-b-[20px] border-b-transparent"></div>
      </div>
      
      <div className={cn(
        "w-28 h-28 bg-gradient-to-tr from-yellow-400 via-orange-400 to-red-400 rounded-full border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden ring-8 ring-blue-100 flex-shrink-0 transition-transform",
        isSparkling && "scale-125 rotate-12"
      )}>
          <span className="text-7xl drop-shadow-lg">{childName.length % 2 === 0 ? '🦊' : '🦉'}</span>
      </div>
    </motion.div>
  );
}
