import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, X, Check, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface MiniGameProps {
  word: string;
  image: string;
  onComplete: (points: number) => void;
  onClose: () => void;
  themeColor?: string;
}

type GameType = 'memory' | 'matching';

export function MiniGame({ word, image, onComplete, onClose, themeColor = '#3B82F6' }: MiniGameProps) {
  const [gameType] = useState<GameType>(Math.random() > 0.5 ? 'memory' : 'matching');
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Memory Game State
  const [cards, setCards] = useState<{ id: number, content: string, isFlipped: boolean, isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // Matching Game State
  const [matchingOptions, setMatchingOptions] = useState<{ content: string, isCorrect: boolean }[]>([]);

  useEffect(() => {
    if (gameType === 'memory') {
      const contents = [word, word, image, image];
      const shuffled = contents
        .map((content, id) => ({ id, content, isFlipped: false, isMatched: false }))
        .sort(() => Math.random() - 0.5);
      setCards(shuffled);
    } else {
      const options = [
        { content: word, isCorrect: true },
        { content: 'Cuchara', isCorrect: false },
        { content: 'Avión', isCorrect: false },
        { content: 'Zapato', isCorrect: false }
      ].sort(() => Math.random() - 0.5);
      setMatchingOptions(options);
    }
  }, [gameType, word, image]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].content === cards[second].content || 
         (cards[first].content === word && cards[second].content === image) ||
         (cards[first].content === image && cards[second].content === word)) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          
          if (matchedCards.every(c => c.isMatched)) {
            handleWin();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleMatchingSelection = (option: typeof matchingOptions[0]) => {
    if (option.isCorrect) {
      handleWin();
    } else {
      // Shake or feedback
    }
  };

  const handleWin = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeColor, '#FFD700']
    });
    setScore(25);
    setIsFinished(true);
    setTimeout(() => {
      onComplete(25);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border-8 border-white"
      >
        <div className="p-8 bg-slate-50 flex justify-between items-center border-b-4 border-slate-100">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Mini-Juego de Bonus</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {gameType === 'memory' ? 'Encuentra las parejas' : '¿Cuál es la palabra correcta?'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div 
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                {gameType === 'memory' ? (
                  <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                    {cards.map((card, idx) => (
                      <motion.button
                        key={card.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCardClick(idx)}
                        className={cn(
                          "aspect-square rounded-3xl text-4xl font-black transition-all duration-300 transform preserve-3d relative",
                          card.isFlipped || card.isMatched ? "rotate-y-0" : "rotate-y-180"
                        )}
                      >
                        <div className={cn(
                          "absolute inset-0 rounded-3xl flex items-center justify-center backface-hidden",
                          card.isMatched ? "bg-emerald-100 text-emerald-600" : "bg-white border-4 border-slate-200 text-slate-700 shadow-lg"
                        )}>
                          {card.content}
                        </div>
                        <div 
                          className="absolute inset-0 rounded-3xl flex items-center justify-center backface-hidden rotate-y-180 bg-primary shadow-xl border-4 border-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Star className="w-12 h-12 text-white fill-current opacity-30" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8 text-center">
                    <div className="text-9xl mb-8 transform -rotate-6">{image}</div>
                    <div className="grid grid-cols-2 gap-4">
                      {matchingOptions.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMatchingSelection(opt)}
                          className="p-6 bg-slate-50 hover:bg-white hover:border-primary border-4 border-slate-100 rounded-[2rem] font-black text-2xl text-slate-700 transition-all shadow-md"
                          style={{ borderColor: 'transparent' }}
                        >
                          {opt.content}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="summary"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-yellow-50">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                </div>
                <h2 className="text-5xl font-black text-slate-800 italic uppercase">¡Fantástico!</h2>
                <p className="text-xl font-bold text-slate-400">Has ganado {score} puntos extra</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
