/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Sliders, Palette, Code, Square, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function App() {
  // State for neumorphic properties
  const [bgColor, setBgColor] = useState('#e0e5ec');
  const [size, setSize] = useState(200);
  const [radius, setRadius] = useState(40);
  const [distance, setDistance] = useState(20);
  const [blur, setBlur] = useState(40);
  const [intensity, setIntensity] = useState(0.15);
  const [isInset, setIsInset] = useState(false);
  const [copied, setCopied] = useState(false);

  // Derived shadow colors
  const darkShadow = useMemo(() => adjustBrightness(bgColor, -intensity), [bgColor, intensity]);
  const lightShadow = useMemo(() => adjustBrightness(bgColor, intensity + 0.1), [bgColor, intensity]);

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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Preview Section */}
        <section className="flex flex-col items-center justify-center space-y-8 order-1 lg:order-2">
          <motion.div 
            layout
            className="relative flex items-center justify-center"
            style={{ 
              width: size + 100, 
              height: size + 100 
            }}
          >
            <motion.div
              id="element-preview"
              animate={{
                boxShadow: shadowString,
                borderRadius: `${radius}px`,
                backgroundColor: bgColor,
                width: size,
                height: size
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="transition-colors duration-300"
            />
          </motion.div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 opacity-80">Neumorphism Generator</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Soft UI Designer Tool</p>
          </div>
        </section>

        {/* Controls Section */}
        <section 
          className="p-8 rounded-[40px] space-y-8 order-2 lg:order-1 transition-all duration-300"
          style={{ 
            backgroundColor: bgColor,
            boxShadow: `9px 9px 16px ${darkShadow}, -9px -9px 16px ${lightShadow}`
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Picker */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Palette size={14} /> Cor de Fundo
              </label>
              <div className="relative group">
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer bg-transparent border-none outline-none"
                />
                <div 
                  className="absolute inset-0 pointer-events-none rounded-xl border-2 border-white/20"
                  style={{ boxShadow: `inset 2px 2px 5px ${darkShadow}, inset -2px -2px 5px ${lightShadow}` }}
                />
              </div>
            </div>

            {/* Inset Toggle */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Square size={14} /> Estilo
              </label>
              <button
                onClick={() => setIsInset(!isInset)}
                className="w-full h-12 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: bgColor,
                  boxShadow: isInset 
                    ? `inset 4px 4px 8px ${darkShadow}, inset -4px -4px 8px ${lightShadow}`
                    : `4px 4px 8px ${darkShadow}, -4px -4px 8px ${lightShadow}`,
                  color: isInset ? '#6d5dfc' : '#444'
                }}
              >
                {isInset ? 'Sombra Interna (Inset)' : 'Sombra Externa'}
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            <Slider 
              label="Tamanho" 
              value={size} 
              min={100} 
              max={300} 
              onChange={setSize} 
              darkShadow={darkShadow} 
              lightShadow={lightShadow} 
            />
            <Slider 
              label="Raio (Radius)" 
              value={radius} 
              min={0} 
              max={150} 
              onChange={setRadius} 
              darkShadow={darkShadow} 
              lightShadow={lightShadow} 
            />
            <Slider 
              label="Distância" 
              value={distance} 
              min={0} 
              max={50} 
              onChange={setDistance} 
              darkShadow={darkShadow} 
              lightShadow={lightShadow} 
            />
            <Slider 
              label="Desfoque (Blur)" 
              value={blur} 
              min={0} 
              max={100} 
              onChange={setBlur} 
              darkShadow={darkShadow} 
              lightShadow={lightShadow} 
            />
            <Slider 
              label="Intensidade" 
              value={intensity} 
              min={0.01} 
              max={0.4} 
              step={0.01} 
              onChange={setIntensity} 
              darkShadow={darkShadow} 
              lightShadow={lightShadow} 
            />
          </div>

          {/* Code Output */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Code size={14} /> Código CSS
            </label>
            <div 
              className="p-4 rounded-2xl relative group overflow-hidden"
              style={{ 
                backgroundColor: bgColor,
                boxShadow: `inset 4px 4px 8px ${darkShadow}, inset -4px -4px 8px ${lightShadow}`
              }}
            >
              <code className="text-xs font-mono break-all text-[#6d5dfc] block pr-10">
                box-shadow: {shadowString};
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: bgColor,
                  boxShadow: copied 
                    ? `inset 2px 2px 4px ${darkShadow}, inset -2px -2px 4px ${lightShadow}`
                    : `3px 3px 6px ${darkShadow}, -3px -3px 6px ${lightShadow}`
                }}
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  darkShadow: string;
  lightShadow: string;
}

function Slider({ label, value, min, max, step = 1, onChange, darkShadow, lightShadow }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        <span className="text-xs font-mono text-gray-500">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent z-10"
          style={{
            // Custom range styling is tricky in pure React/Tailwind without a library,
            // but we can use the inset shadows on a wrapper
          }}
        />
        <div 
          className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
          style={{ boxShadow: `inset 2px 2px 4px ${darkShadow}, inset -2px -2px 4px ${lightShadow}` }}
        />
        {/* Progress bar */}
        <div 
          className="absolute left-0 h-2 rounded-full pointer-events-none bg-[#6d5dfc] opacity-20"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}

