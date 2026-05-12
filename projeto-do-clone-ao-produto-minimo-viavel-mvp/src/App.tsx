/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Copy, Check, Sliders, Palette, Code, Square, Circle, LogIn, LogOut, User as UserIcon, Sun, Moon, Undo2, Redo2, Save, Trash2, Bookmark, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, type User,
  db, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, onSnapshot, serverTimestamp,
  remoteConfig, fetchAndActivate, getValue 
} from './firebase';

/**
 * Utility to adjust color brightness for neumorphic shadows
 * @param hex - Hex color string
 * @param factor - Luminance factor (-1 to 1)
 */
function adjustBrightness(hex: string, factor: number): string {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(s => s + s).join('');
  }
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + (r * factor)));
  g = Math.max(0, Math.min(255, g + (g * factor)));
  b = Math.max(0, Math.min(255, b + (b * factor)));

  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface NeumorphSettings {
  bgColor: string;
  size: number;
  radius: number;
  distance: number;
  blur: number;
  intensity: number;
  isInset: boolean;
  shape: 'square' | 'circle';
}

interface Preset extends NeumorphSettings {
  id: string;
  name: string;
  createdAt: any;
}

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Neumorphic settings state
  const [settings, setSettings] = useState<NeumorphSettings>({
    bgColor: '#f0f2f5',
    size: 240,
    radius: 48,
    distance: 20,
    blur: 40,
    intensity: 0.15,
    isInset: false,
    shape: 'square',
  });

  // History state
  const [history, setHistory] = useState<NeumorphSettings[]>([]);
  const [redoStack, setRedoStack] = useState<NeumorphSettings[]>([]);
  const isInternalUpdate = useRef(false);

  // Presets state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [copied, setCopied] = useState(false);

  // Destructure settings for convenience
  const { bgColor, size, radius, distance, blur, intensity, isInset, shape } = settings;

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Remote Config effect
  useEffect(() => {
    fetchAndActivate(remoteConfig)
      .then(() => {
        const maxPresets = getValue(remoteConfig, 'max_presets_per_user').asNumber();
        console.log('Remote Config: max_presets_per_user =', maxPresets);
      })
      .catch((err) => console.error('Remote Config failed:', err));
  }, []);

  // Fetch presets effect
  useEffect(() => {
    if (!user) {
      setPresets([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'presets'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPresets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Preset[];
      setPresets(loadedPresets);
    });

    return () => unsubscribe();
  }, [user]);

  // History tracking effect
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      setHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(settings)) return prev;
        return [...prev, settings].slice(-50); // Keep last 50 states
      });
      setRedoStack([]);
    }, 300); // Debounce history updates

    return () => clearTimeout(timeoutId);
  }, [settings]);

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    
    isInternalUpdate.current = true;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    setRedoStack(prev => [current, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setSettings(previous);
  }, [history]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    isInternalUpdate.current = true;
    const next = redoStack[0];
    
    setHistory(prev => [...prev, next]);
    setRedoStack(prev => prev.slice(1));
    setSettings(next);
  }, [redoStack]);

  const updateSetting = (key: keyof NeumorphSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreset = async () => {
    if (!user || !newPresetName.trim()) return;
    
    setIsSavingPreset(true);
    try {
      const presetRef = doc(collection(db, 'users', user.uid, 'presets'));
      await setDoc(presetRef, {
        ...settings,
        name: newPresetName.trim(),
        createdAt: serverTimestamp()
      });
      setNewPresetName('');
      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving preset:", error);
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'presets', id));
    } catch (error) {
      console.error("Error deleting preset:", error);
    }
  };

  const loadPreset = (preset: Preset) => {
    const { id, name, createdAt, ...presetSettings } = preset;
    setSettings(presetSettings);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Derived shadow colors
  const darkShadow = useMemo(() => {
    const isDark = bgColor === '#1a1a1a' || intensity > 0.3;
    return adjustBrightness(bgColor, isDark ? -0.4 : -intensity);
  }, [bgColor, intensity]);

  const lightShadow = useMemo(() => {
    const isDark = bgColor === '#1a1a1a';
    return adjustBrightness(bgColor, isDark ? 0.1 : intensity + 0.15);
  }, [bgColor, intensity]);

  // CSS Shadow String
  const shadowString = useMemo(() => {
    const insetStr = isInset ? 'inset ' : '';
    return `${insetStr}${distance}px ${distance}px ${blur}px ${darkShadow}, ${insetStr}-${distance}px -${distance}px ${blur}px ${lightShadow}`;
  }, [distance, blur, darkShadow, lightShadow, isInset]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`box-shadow: ${shadowString};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-[400px] xl:w-[450px] border-r border-slate-100 bg-white flex flex-col h-screen overflow-y-auto z-20">
        <div className="p-8 space-y-10">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Neumorph</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Soft UI Studio</p>
            </div>
            
            <AnimatePresence mode="wait">
              {isAuthLoading ? (
                <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
              ) : user ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-900 line-clamp-1">{user.displayName}</p>
                    <button onClick={handleLogout} className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700">Sair</button>
                  </div>
                  <img src={user.photoURL || ''} className="w-8 h-8 rounded-full ring-2 ring-slate-50" referrerPolicy="no-referrer" />
                </motion.div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <LogIn size={18} />
                </button>
              )}
            </AnimatePresence>
          </header>

          <div className="space-y-8">
            {/* History Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={undo}
                disabled={history.length <= 1}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all active:scale-95"
                title="Undo"
              >
                <Undo2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Undo</span>
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all active:scale-95"
                title="Redo"
              >
                <Redo2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Redo</span>
              </button>
            </div>

            {/* Theme Presets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Palette size={12} /> Theme Presets
                </label>
                {user && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Save size={12} /> Save Current
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Light', color: '#f0f2f5', icon: <Sun size={14} /> },
                  { name: 'Dark', color: '#1a1a1a', icon: <Moon size={14} /> },
                  { name: 'Clay', color: '#e0e5ec', icon: <Palette size={14} /> }
                ].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => updateSetting('bgColor', theme.color)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      bgColor === theme.color ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="text-slate-600">{theme.icon}</div>
                    <span className="text-[10px] font-bold text-slate-500">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Presets */}
            {user && presets.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Bookmark size={12} /> My Presets
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {presets.map((preset) => (
                    <div 
                      key={preset.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all"
                    >
                      <button 
                        onClick={() => loadPreset(preset)}
                        className="flex-1 text-left flex items-center gap-3"
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-slate-200" 
                          style={{ backgroundColor: preset.bgColor }}
                        />
                        <span className="text-[11px] font-bold text-slate-600 line-clamp-1">{preset.name}</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePreset(preset.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Controls */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shape</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => updateSetting('shape', 'square')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shape === 'square' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Square size={12} /> Square
                    </button>
                    <button 
                      onClick={() => updateSetting('shape', 'circle')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shape === 'circle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Circle size={12} /> Circle
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shadow Style</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => updateSetting('isInset', false)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isInset ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Outset
                    </button>
                    <button 
                      onClick={() => updateSetting('isInset', true)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isInset ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Inset
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <ModernSlider label="Size" value={size} min={100} max={400} onChange={(v) => updateSetting('size', v)} />
                {shape === 'square' && (
                  <ModernSlider label="Radius" value={radius} min={0} max={200} onChange={(v) => updateSetting('radius', v)} />
                )}
                <ModernSlider label="Distance" value={distance} min={0} max={60} onChange={(v) => updateSetting('distance', v)} />
                <ModernSlider label="Blur" value={blur} min={0} max={120} onChange={(v) => updateSetting('blur', v)} />
                <ModernSlider label="Intensity" value={intensity} min={0.01} max={0.5} step={0.01} onChange={(v) => updateSetting('intensity', v)} />
              </div>
            </div>

            {/* Color Customizer */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Background</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => updateSetting('bgColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-xs font-mono text-slate-600 uppercase">{bgColor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Preset Modal */}
        <AnimatePresence>
          {showSaveModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSaveModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">Save Preset</h3>
                  <p className="text-xs text-slate-500">Give your configuration a name to find it later.</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text"
                    placeholder="Preset Name (e.g. Soft Blue)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowSaveModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSavePreset}
                      disabled={!newPresetName.trim() || isSavingPreset}
                      className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingPreset ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Preset
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Code */}
        <div className="mt-auto p-8 bg-slate-50/50 border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CSS Output</label>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Code</>}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed break-all">
              box-shadow: {shadowString};
            </div>
          </div>
        </div>
      </aside>

      {/* Preview Stage */}
      <main className="flex-1 relative flex items-center justify-center bg-slate-50/30 p-12 lg:p-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
          <div 
            className="flex items-center justify-center transition-all duration-500"
            style={{ width: size + 100, height: size + 100 }}
          >
            <motion.div
              animate={{
                boxShadow: shadowString,
                borderRadius: shape === 'circle' ? '50%' : `${radius}px`,
                backgroundColor: bgColor,
                width: size,
                height: size
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative group"
            >
              {/* Subtle Inner Glow for Premium Feel */}
              {!isInset && (
                <div 
                  className="absolute inset-0 rounded-[inherit] opacity-30 pointer-events-none"
                  style={{ boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.4), inset -1px -1px 0px rgba(0,0,0,0.1)' }}
                />
              )}
            </motion.div>
          </div>

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              Live Preview
            </div>
            <h2 className="text-slate-400 text-sm font-medium">
              Adjust the controls to see the <span className="text-slate-900 font-bold">Soft UI</span> effect in real-time.
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
}

function ModernSlider({ label, value, min, max, step = 1, onChange }: { label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{value}</span>
      </div>
      <div className="relative group">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
        />
      </div>
    </div>
  );
}

