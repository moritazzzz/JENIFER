/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from './lib/utils';
import { Welcome } from './components/Welcome';
import { TherapistDashboard } from './components/therapist/Dashboard';
import { ChildSetup } from './components/child/ChildSetup';
import { ChildSelection } from './components/child/ChildSelection';
import { WorldMap } from './components/child/WorldMap';
import { Activity } from './components/child/Activity';
import { SessionSummary } from './components/child/SessionSummary';
import { type Child, type Therapist, type Session, type Difficulty } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type View = 'welcome' | 'therapist-dashboard' | 'child-selection' | 'child-setup' | 'world-map' | 'activity' | 'summary';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [currentUser, setCurrentUser] = useState<Therapist | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        // Use real-time listener for therapist profile
        const docRef = doc(db, 'therapists', user.uid);
        import('firebase/firestore').then(({ onSnapshot }) => {
          unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setCurrentUser(docSnap.data() as Therapist);
            } else {
              setCurrentUser(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Profile listen error:", error);
            // Handle error anonymously
            const errInfo = {
              error: error.message,
              operationType: 'get',
              path: `therapists/${user.uid}`,
              authInfo: { userId: user.uid, isAnonymous: user.isAnonymous }
            };
            console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
            setLoading(false);
          });
        });
      } else {
        // Auto-login as guest for immediate access (only once per mount to avoid loops)
        import('firebase/auth').then(({ signInAnonymously }) => {
          signInAnonymously(auth).catch(err => {
             console.error("Auto guest login failed:", err);
             // We don't retry here to avoid hitting too-many-requests
             if (err.code === 'auth/admin-restricted-operation') {
               console.warn("⚠️ Anonymous Auth is disabled. Please enable 'Anonymous' provider in Firebase Console > Authentication > Sign-in method.");
             } else if (err.code === 'auth/too-many-requests') {
               console.error("Demasiadas solicitudes de inicio de sesión. Por favor, espere un momento y actualice la página.");
             }
             // If this fails, we still stop loading so the UI can show the login screen or error state
             setLoading(false);
          });
        });
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleStartChildAdventure = (child: Child) => {
    setActiveChild(child);
    setView('world-map');
  };

  const handleFinishSession = (session: Session) => {
    setLastSession(session);
    setView('summary');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-slate-200 min-h-screen flex items-center justify-center transition-all duration-500",
      isFullscreen ? "p-0" : "p-0 md:p-4"
    )}>
      <div className={cn(
        "app-container relative overflow-hidden group/app",
        isFullscreen && "is-fullscreen"
      )}>
        {/* Fullscreen Toggle Button */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-[200] p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white shadow-lg transition-all opacity-0 group-hover/app:opacity-100 hover:scale-110 active:scale-95"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <Welcome 
            key="welcome"
            onChildAccess={() => setView('child-selection')} 
            onTherapistAccess={() => setView('therapist-dashboard')} 
          />
        )}
        {view === 'child-selection' && (
          <ChildSelection
            key="selection"
            onSelect={handleStartChildAdventure}
            onCreateNew={() => setView('child-setup')}
            onBack={() => setView('welcome')}
          />
        )}
        {view === 'therapist-dashboard' && (
          <TherapistDashboard 
            key="therapist"
            user={currentUser} 
            onBack={() => setView('welcome')} 
            onStartChild={handleStartChildAdventure}
          />
        )}
        {view === 'child-setup' && (
          <ChildSetup 
            key="setup"
            onComplete={handleStartChildAdventure} 
            onBack={() => setView('child-selection')}
          />
        )}
        {view === 'world-map' && activeChild && (
          <WorldMap 
            key="map"
            child={activeChild}
            onSelectActivity={(diff) => {
              setSelectedDifficulty(diff);
              setView('activity');
            }}
            onBack={() => setView('welcome')}
          />
        )}
        {view === 'activity' && activeChild && (
          <Activity 
            key="activity"
            child={activeChild}
            difficulty={selectedDifficulty || undefined}
            onFinish={handleFinishSession}
            onCancel={() => setView('world-map')}
          />
        )}
        {view === 'summary' && activeChild && lastSession && (
          <SessionSummary 
            key="summary"
            child={activeChild}
            session={lastSession}
            onDone={() => setView('welcome')}
            onBackToMap={() => setView('world-map')}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
