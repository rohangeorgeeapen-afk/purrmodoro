import React, { useState, useEffect, useRef } from 'react';
import { TimerMode } from './types';
import { DEFAULT_SETTINGS, MODE_LABELS, MODE_COLORS } from './constants';
import TimerDisplay from './components/TimerDisplay';
import CatMascot from './components/CatMascot';

// Helper Icon Components
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETTINGS.workDuration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showNotificationWarning, setShowNotificationWarning] = useState<boolean>(false);
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('purrmodoro-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return {
          workDuration: DEFAULT_SETTINGS.workDuration,
          shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
          longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
        };
      }
    }
    return {
      workDuration: DEFAULT_SETTINGS.workDuration,
      shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
      longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
    };
  });
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio and check notification permission
  useEffect(() => {
    audioRef.current = new Audio('/ring/short.mp3');
    audioRef.current.preload = 'auto';
    
    // Check if user has dismissed the warning before
    const hasSeenWarning = localStorage.getItem('purrmodoro-notification-warning-dismissed');
    
    // Show warning if notifications are not granted and user hasn't dismissed it
    if ('Notification' in window && Notification.permission === 'default' && !hasSeenWarning) {
      setShowNotificationWarning(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    setShowNotificationWarning(false);
  };

  const handleDismissWarning = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('purrmodoro-notification-warning-dismissed', 'true');
    }
    setShowNotificationWarning(false);
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PurrModoro Timer Complete!', {
          body: mode === TimerMode.WORK ? 'Time for a break!' : 'Time to focus!',
          icon: '/Doodle/S1.jpeg',
        });
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === TimerMode.WORK) setTimeLeft(settings.workDuration);
    if (mode === TimerMode.SHORT_BREAK) setTimeLeft(settings.shortBreakDuration);
    if (mode === TimerMode.LONG_BREAK) setTimeLeft(settings.longBreakDuration);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === TimerMode.WORK) setTimeLeft(settings.workDuration);
    if (newMode === TimerMode.SHORT_BREAK) setTimeLeft(settings.shortBreakDuration);
    if (newMode === TimerMode.LONG_BREAK) setTimeLeft(settings.longBreakDuration);
  };

  const getTotalTime = () => {
    if (mode === TimerMode.WORK) return settings.workDuration;
    if (mode === TimerMode.SHORT_BREAK) return settings.shortBreakDuration;
    return settings.longBreakDuration;
  };

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    // Save to localStorage
    localStorage.setItem('purrmodoro-settings', JSON.stringify(newSettings));
    setShowSettings(false);
    // Update current timer if not active
    if (!isActive) {
      if (mode === TimerMode.WORK) setTimeLeft(newSettings.workDuration);
      if (mode === TimerMode.SHORT_BREAK) setTimeLeft(newSettings.shortBreakDuration);
      if (mode === TimerMode.LONG_BREAK) setTimeLeft(newSettings.longBreakDuration);
    }
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center transition-colors duration-500 ${MODE_COLORS[mode]} bg-opacity-20 py-6 px-4 lg:py-12`}>
      
      <header className="mb-6 lg:mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-doodle-black mb-2 tracking-wide drop-shadow-sm">
          PurrModoro
        </h1>
        <p className="text-lg lg:text-xl text-gray-600">Focus with your fluffy friend</p>
      </header>

      <main className="w-full max-w-md lg:max-w-3xl bg-white border-2 border-doodle-black rounded-[2rem] shadow-doodle p-4 sm:p-6 lg:px-8 lg:py-4 relative overflow-hidden transition-all duration-300">
        
        {/* 
          Responsive Layout:
          - Mobile: Flex Column (Toggles -> Timer -> Mascot -> Controls)
          - Desktop (lg): Grid (Left Col: Toggles/Timer/Controls, Right Col: Mascot)
        */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-4 lg:gap-y-2 items-center w-full z-10">

            {/* 1. Mode Toggles */}
            {/* Mobile: Top. Desktop: Top Left Cell */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 lg:mb-0 lg:col-start-1 lg:row-start-1 w-full lg:self-end">
            {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
                <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full border-2 border-doodle-black font-bold text-xs sm:text-sm transition-all duration-200 
                    ${mode === m 
                    ? `${MODE_COLORS[m]} shadow-doodle transform -translate-y-1` 
                    : 'bg-white hover:bg-gray-50'}`}
                >
                {MODE_LABELS[m]}
                </button>
            ))}
            </div>

            {/* 2. Timer Visualization */}
            {/* Mobile: Second. Desktop: Middle Left Cell */}
            <div className="flex justify-center mb-4 lg:mb-0 lg:col-start-1 lg:row-start-2">
                <TimerDisplay 
                    timeLeft={timeLeft} 
                    totalTime={getTotalTime()} 
                    mode={mode} 
                />
            </div>

            {/* 3. Mascot & Quote */}
            {/* Mobile: Third. Desktop: Right Column (Spanning 3 rows for balance) */}
            <div className="flex justify-center w-full mb-4 lg:mb-0 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:h-full lg:items-center">
                <CatMascot mode={mode} isActive={isActive} timeLeft={timeLeft} totalTime={getTotalTime()} />
            </div>

            {/* 4. Controls */}
            {/* Mobile: Bottom. Desktop: Bottom Left Cell */}
            <div className="flex space-x-4 sm:space-x-6 lg:col-start-1 lg:row-start-3 justify-center lg:self-start">
                <button
                    onClick={toggleTimer}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-pastel-pink border-2 border-doodle-black rounded-full shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
                    aria-label={isActive ? "Pause Timer" : "Start Timer"}
                >
                    {isActive ? <PauseIcon /> : <PlayIcon />}
                </button>
                
                <button
                    onClick={resetTimer}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white border-2 border-doodle-black rounded-full shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
                    aria-label="Reset Timer"
                >
                    <ResetIcon />
                </button>
                
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white border-2 border-doodle-black rounded-full shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
                    aria-label="Settings"
                >
                    <SettingsIcon />
                </button>
            </div>

        </div>

      </main>

      <footer className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 text-center font-bold opacity-60">
        <p>Keep going! You're doing great.</p>
      </footer>

      {/* Notification Warning Modal */}
      {showNotificationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-doodle-black rounded-3xl shadow-doodle-hover p-6 sm:p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-2xl font-bold text-doodle-black mb-3">Enable Notifications</h2>
              <p className="text-gray-700 leading-relaxed">
                PurrModoro will notify you when your timer is complete, even when you're working in another tab. 
                Please allow notifications when your browser asks!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleEnableNotifications}
                className="w-full px-6 py-3 bg-pastel-pink border-2 border-doodle-black rounded-full font-bold shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => handleDismissWarning(false)}
                className="w-full px-6 py-3 bg-white border-2 border-doodle-black rounded-full font-bold shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={() => handleDismissWarning(true)}
                className="w-full px-6 py-2 text-sm text-gray-500 hover:text-gray-700 transition-all"
              >
                Don't show this again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-doodle-black rounded-3xl shadow-doodle-hover p-6 sm:p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            
            <h2 className="text-2xl font-bold text-doodle-black mb-6">Timer Settings</h2>
            
            <SettingsForm 
              settings={settings} 
              onSave={saveSettings}
              onCancel={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface SettingsFormProps {
  settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number };
  onSave: (settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number }) => void;
  onCancel: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave, onCancel }) => {
  const [workMinutes, setWorkMinutes] = useState(Math.floor(settings.workDuration / 60));
  const [workSeconds, setWorkSeconds] = useState(settings.workDuration % 60);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.floor(settings.shortBreakDuration / 60));
  const [shortBreakSeconds, setShortBreakSeconds] = useState(settings.shortBreakDuration % 60);
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.floor(settings.longBreakDuration / 60));
  const [longBreakSeconds, setLongBreakSeconds] = useState(settings.longBreakDuration % 60);

  const handleSave = () => {
    onSave({
      workDuration: Math.max(1, workMinutes * 60 + workSeconds),
      shortBreakDuration: Math.max(1, shortBreakMinutes * 60 + shortBreakSeconds),
      longBreakDuration: Math.max(1, longBreakMinutes * 60 + longBreakSeconds),
    });
  };

  const handleReset = () => {
    setWorkMinutes(Math.floor(DEFAULT_SETTINGS.workDuration / 60));
    setWorkSeconds(DEFAULT_SETTINGS.workDuration % 60);
    setShortBreakMinutes(Math.floor(DEFAULT_SETTINGS.shortBreakDuration / 60));
    setShortBreakSeconds(DEFAULT_SETTINGS.shortBreakDuration % 60);
    setLongBreakMinutes(Math.floor(DEFAULT_SETTINGS.longBreakDuration / 60));
    setLongBreakSeconds(DEFAULT_SETTINGS.longBreakDuration % 60);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-doodle-black mb-2">Focus Time</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={workMinutes}
            onChange={(e) => setWorkMinutes(Math.max(0, Number(e.target.value)))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            placeholder="Min"
          />
          <span className="text-2xl font-bold">:</span>
          <input
            type="number"
            value={workSeconds}
            onChange={(e) => setWorkSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            placeholder="Sec"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-doodle-black mb-2">Short Break</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={shortBreakMinutes}
            onChange={(e) => setShortBreakMinutes(Math.max(0, Number(e.target.value)))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue"
            placeholder="Min"
          />
          <span className="text-2xl font-bold">:</span>
          <input
            type="number"
            value={shortBreakSeconds}
            onChange={(e) => setShortBreakSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-blue"
            placeholder="Sec"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-doodle-black mb-2">Long Break</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(Math.max(0, Number(e.target.value)))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-yellow"
            placeholder="Min"
          />
          <span className="text-2xl font-bold">:</span>
          <input
            type="number"
            value={longBreakSeconds}
            onChange={(e) => setLongBreakSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="flex-1 px-4 py-2 border-2 border-doodle-black rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-yellow"
            placeholder="Sec"
          />
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-pastel-pink border-2 border-doodle-black rounded-full font-bold shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border-2 border-doodle-black rounded-full font-bold shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={handleReset}
          className="w-full px-6 py-3 bg-pastel-yellow border-2 border-doodle-black rounded-full font-bold shadow-doodle hover:shadow-doodle-hover active:shadow-doodle-pressed active:translate-y-1 transition-all"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default App;