import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Star, Mic, Music, Eye, PencilLine, Clock } from 'lucide-react';
import { AVATARS, THEME_COLORS } from '../../constants';
import { type Child, type LearningLevel, type Difficulty, type LearningStyle, type AssistantVoice } from '../../types';
import { db, auth, handleFirestoreError, OperationType } from '../../services/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ChildSetupProps {
  onComplete: (child: Child) => void;
  onBack: () => void;
}

export function ChildSetup({ onComplete, onBack }: ChildSetupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Child>>({
    name: '',
    age: 6,
    avatar: 'lion',
    themeColor: THEME_COLORS[0].value,
    assistantVoice: 'female',
    learningLevel: 'silábico',
    difficulty: 'easy',
    learningStyle: 'visual',
    sessionDuration: 10,
    points: 0,
    stars: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const id = crypto.randomUUID();
    const therapistId = auth.currentUser?.uid || 'guest-therapist';
    const path = `children/${id}`;
    
    try {
      const completeChild: Child = {
        ...formData,
        id,
        therapistId,
      } as Child;

      await setDoc(doc(db, 'children', id), completeChild);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => onComplete(completeChild), 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">¿Cómo te llamas, explorador?</h2>
            <input
              type="text"
              placeholder="Escribe tu nombre aquí"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ borderColor: formData.themeColor + '40' }}
              className="w-full p-4 text-2xl border-4 rounded-3xl focus:border-opacity-100 outline-none transition-all text-center"
            />
            <div className="mt-8 flex justify-center gap-4">
              <p className="text-xl text-gray-600">Y tengo </p>
              <input
                type="number"
                min="4"
                max="12"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                style={{ borderBottomColor: formData.themeColor }}
                className="w-20 p-2 text-xl border-b-4 outline-none text-center font-bold"
              />
              <p className="text-xl text-gray-600">años</p>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 italic">Elige tu Avatar Mágico</h2>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                  className={cn(
                    "p-6 rounded-3xl text-6xl transition-all border-4",
                    formData.avatar === avatar.id ? "border-blue-500 scale-105 shadow-lg bg-blue-50" : "border-transparent grayscale hover:grayscale-0 hover:border-blue-200"
                  )}
                >
                  {avatar.icon}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Personaliza tu Aventrua</h2>
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-semibold text-gray-600 uppercase text-xs tracking-widest">Color de Tema</p>
                <div className="flex gap-4 justify-center">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, themeColor: color.value })}
                      style={{ backgroundColor: color.value }}
                      className={cn(
                        "w-12 h-12 rounded-full border-4 transition-all",
                        formData.themeColor === color.value ? "border-white ring-4 ring-blue-400 scale-110" : "border-transparent"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 font-semibold text-gray-600 uppercase text-xs tracking-widest">Voz del Asistente</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, assistantVoice: 'male' })}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 flex items-center justify-center gap-2",
                      formData.assistantVoice === 'male' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"
                    )}
                  >
                    <span>👨</span> Voz Masculina
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, assistantVoice: 'female' })}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 flex items-center justify-center gap-2",
                      formData.assistantVoice === 'female' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"
                    )}
                  >
                    <span>👩</span> Voz Femenina
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Nivel y Estilo</h2>
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Nivel</p>
                  {(['presilábico', 'silábico', 'alfabético'] as LearningLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, learningLevel: level })}
                      className={cn(
                        "w-full p-4 rounded-xl text-left border-2 flex items-center justify-between",
                        formData.learningLevel === level ? "border-blue-500 bg-blue-50" : "border-gray-100"
                      )}
                    >
                      <span className="capitalize">{level}</span>
                      {formData.learningLevel === level && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Estilo</p>
                   {(['visual', 'auditivo', 'escritura'] as LearningStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => setFormData({ ...formData, learningStyle: style })}
                      className={cn(
                        "w-full p-4 rounded-xl text-left border-2 flex items-center justify-between",
                        formData.learningStyle === style ? "border-blue-500 bg-blue-50" : "border-gray-100"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {style === 'visual' && <Eye className="w-4 h-4" />}
                        {style === 'auditivo' && <Mic className="w-4 h-4" />}
                        {style === 'escritura' && <PencilLine className="w-4 h-4" />}
                        <span className="capitalize">{style}</span>
                      </span>
                      {formData.learningStyle === style && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Duración de sesión
                </p>
                <div className="flex gap-4">
                  {[5, 10, 15].map(time => (
                    <button
                      key={time}
                      onClick={() => setFormData({ ...formData, sessionDuration: time })}
                      className={cn(
                        "flex-1 p-3 rounded-xl border-2 font-bold",
                        formData.sessionDuration === time ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100"
                      )}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-blue-50 p-6 md:p-12 overflow-y-auto custom-scrollbar">
      <motion.div
        layout
        className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-3xl p-8 md:p-14 relative overflow-hidden border-8 border-white"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            className="h-full bg-blue-500" 
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <button 
          onClick={step === 1 ? onBack : prevStep}
          className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </button>

        <div className="text-center">
          {renderStep()}

          <div className="mt-12 flex justify-center">
            {step < 4 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={step === 1 && !formData.name}
                style={{ backgroundColor: formData.themeColor }}
                className="text-white px-12 py-4 rounded-2xl font-bold text-xl flex items-center gap-2 disabled:opacity-50"
              >
                Siguiente <ArrowRight className="w-6 h-6" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                disabled={isSubmitting}
                className="bg-green-500 text-white px-12 py-4 rounded-2xl font-bold text-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Creando..." : "¡Empezar Aventura!"} <Star className="w-6 h-6 fill-current" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
