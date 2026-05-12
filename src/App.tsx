/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Settings, 
  Trash2, 
  Copy, 
  Download, 
  Sparkles, 
  Loader2, 
  ChevronRight,
  MonitorPlay,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Square,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBulkPrompts, ScenePrompt } from './services/gemini';

export default function App() {
  const [script, setScript] = useState(() => localStorage.getItem('cb_script') || '');
  const [style, setStyle] = useState(() => localStorage.getItem('cb_style') || 'Cinematic, hyper-realistic, 8k, anamorphic lens flares, dramatic lighting, highly detailed textures');
  const [negativePrompt, setNegativePrompt] = useState(() => localStorage.getItem('cb_neg') || 'blurry, low quality, distorted, deformed, text, watermarks, bad anatomy, simple background');
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('cb_key') || '');
  const [secondsPerScene, setSecondsPerScene] = useState(() => Number(localStorage.getItem('cb_sec')) || 5);
  const [wordsPerSecond, setWordsPerSecond] = useState(() => Number(localStorage.getItem('cb_wps')) || 2);
  const [multiview, setMultiview] = useState(() => localStorage.getItem('cb_mv') === 'true');
  const [strictImage, setStrictImage] = useState(() => localStorage.getItem('cb_strict') === 'true');
  const [selectedMotions, setSelectedMotions] = useState<string[]>(() => {
    const saved = localStorage.getItem('cb_motions');
    return saved ? JSON.parse(saved) : ['Static Camera', 'Pan Right', 'Tilt Down', 'Zoom In', 'Tracking Shot'];
  });
  const [selectedShotTypes, setSelectedShotTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('cb_shots');
    return saved ? JSON.parse(saved) : ['Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Low Angle', 'High Angle'];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<ScenePrompt[]>(() => {
    const saved = localStorage.getItem('cb_scenes');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => localStorage.setItem('cb_script', script), [script]);
  useEffect(() => localStorage.setItem('cb_style', style), [style]);
  useEffect(() => localStorage.setItem('cb_neg', negativePrompt), [negativePrompt]);
  useEffect(() => localStorage.setItem('cb_key', customApiKey), [customApiKey]);
  useEffect(() => localStorage.setItem('cb_sec', secondsPerScene.toString()), [secondsPerScene]);
  useEffect(() => localStorage.setItem('cb_wps', wordsPerSecond.toString()), [wordsPerSecond]);
  useEffect(() => localStorage.setItem('cb_mv', multiview.toString()), [multiview]);
  useEffect(() => localStorage.setItem('cb_strict', strictImage.toString()), [strictImage]);
  useEffect(() => localStorage.setItem('cb_motions', JSON.stringify(selectedMotions)), [selectedMotions]);
  useEffect(() => localStorage.setItem('cb_shots', JSON.stringify(selectedShotTypes)), [selectedShotTypes]);
  useEffect(() => localStorage.setItem('cb_scenes', JSON.stringify(scenes)), [scenes]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError("Please provide a script.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const results = await generateBulkPrompts(
        script, 
        style, 
        secondsPerScene, 
        multiview, 
        negativePrompt, 
        customApiKey, 
        wordsPerSecond,
        selectedMotions,
        strictImage,
        selectedShotTypes
      );
      setScenes(results);
    } catch (err: any) {
      setError(err.message || "Failed to generate prompts. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Script Segment', 'Image Prompt', 'Negative Prompt', 'Video Prompt'];
    const rows = scenes.map(s => [s.id, s.scriptSegment, s.imagePrompt, s.negativePrompt, s.videoPrompt]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'video_prompts.csv');
    link.click();
  };

  const motionOptions = [
    'Static Camera',
    'Pan Left',
    'Pan Right',
    'Tilt Up',
    'Tilt Down',
    'Zoom In',
    'Zoom Out',
    'Tracking Shot',
    'Crane Shot',
    'Handheld Shake'
  ];

  const toggleMotion = (motion: string) => {
    setSelectedMotions(prev => 
      prev.includes(motion) 
        ? prev.filter(m => m !== motion) 
        : [...prev, motion]
    );
  };

  const shotTypeOptions = [
    'Extreme Wide Shot',
    'Wide Shot',
    'Medium Shot',
    'Close-up',
    'Extreme Close-up',
    'Low Angle',
    'High Angle',
    'Bird\'s Eye View',
    'Worm\'s Eye View',
    'Over-the-Shoulder',
    'Point of View (POV)'
  ];

  const toggleShotType = (shot: string) => {
    setSelectedShotTypes(prev => 
      prev.includes(shot) 
        ? prev.filter(s => s !== shot) 
        : [...prev, shot]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1E293B] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            AI Video Workflow 
            <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full ml-3 tracking-widest uppercase">Batch Workflow v2.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-md p-1">
            <div className="px-3 flex items-center gap-2 border-r border-slate-700 mr-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">GEMINI_KEY:</span>
              <input 
                type="password" 
                placeholder="Optional Custom Key..." 
                className="bg-transparent text-xs text-indigo-400 outline-none w-32 placeholder:text-slate-600 focus:w-48 transition-all"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
              />
            </div>
            <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded shadow-sm">100+ Batch</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-400 opacity-50 cursor-not-allowed">Direct Edit</button>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group active:scale-95"
            id="generate-btn"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 group-hover:fill-current" />
            )}
            <span>{isGenerating ? 'Processing...' : 'Generate Sequences'}</span>
          </button>
        </div>
      </header>

      {/* Tool Configuration Bar */}
      <div className="grid grid-cols-5 gap-6 px-8 py-6 bg-[#1E293B]/50 border-b border-slate-700/50 items-start">
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">01. Master Script Entry</label>
          <textarea 
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-slate-200 h-24 resize-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none placeholder:opacity-30" 
            placeholder="Paste your script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            id="script-input"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">02. Style Consistency Anchor</label>
          <textarea 
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-indigo-300 h-24 resize-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none placeholder:opacity-30" 
            placeholder="Visual style prompt..."
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            id="style-input"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">03. Negative Constraints</label>
          <textarea 
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-red-300/60 h-24 resize-none transition-all focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10 outline-none placeholder:opacity-30" 
            placeholder="What to exclude..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            id="negative-input"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">04. Temporal Dynamics</label>
          <div className="relative group">
            <select 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-slate-300 outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-colors"
              value={secondsPerScene}
              onChange={(e) => setSecondsPerScene(Number(e.target.value))}
              id="duration-input"
            >
              <option value="3">3.0s (~6 Words)</option>
              <option value="4">4.0s (~8 Words)</option>
              <option value="5">5.0s (~10 Words)</option>
              <option value="8">8.0s (~16 Words)</option>
              <option value="12">12.0s (~24 Words)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono uppercase opacity-50">Speaking Rate</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.5" 
                    max="10"
                    className="w-12 bg-[#0F172A] border border-slate-700/50 rounded px-1.5 py-0.5 text-[10px] text-indigo-400 outline-none focus:border-indigo-500 transition-all font-mono"
                    value={wordsPerSecond}
                    onChange={(e) => setWordsPerSecond(Number(e.target.value))}
                  />
                  <span className="text-[9px] text-slate-500 font-mono">w/s</span>
                </div>
              </div>
              {error && <span className="text-[10px] text-red-400 italic">! {error}</span>}
            </div>
            <button 
              onClick={() => setStrictImage(!strictImage)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${
                strictImage 
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              id="strict-toggle"
            >
              <Zap className={`w-3 h-3 ${strictImage ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight uppercase">Strict Mode</span>
            </button>
            <button 
              onClick={() => setMultiview(!multiview)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${
                multiview 
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              id="multiview-toggle"
            >
              {multiview ? <LayoutGrid className="w-3 h-3" /> : <Square className="w-3 h-3" />}
              <span className="text-[10px] font-bold tracking-tight uppercase">{multiview ? 'Multiview On' : 'Multiview Off'}</span>
            </button>
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">05. Camera Angles</label>
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-2 h-24 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-1">
              {shotTypeOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded cursor-pointer transition-colors group">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-500 w-3 h-3 rounded border-slate-600 bg-slate-900"
                    checked={selectedShotTypes.includes(opt)}
                    onChange={() => toggleShotType(opt)}
                  />
                  <span className={`text-[10px] ${selectedShotTypes.includes(opt) ? 'text-indigo-400' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[8px] text-slate-600 font-mono uppercase text-right">
            {selectedShotTypes.length} Shot Types Active
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider translate-y-[-2px]">06. Motion Profiles</label>
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-2 h-24 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-1">
              {motionOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded cursor-pointer transition-colors group">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-500 w-3 h-3 rounded border-slate-600 bg-slate-900"
                    checked={selectedMotions.includes(opt)}
                    onChange={() => toggleMotion(opt)}
                  />
                  <span className={`text-[10px] ${selectedMotions.includes(opt) ? 'text-indigo-400' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[8px] text-slate-600 font-mono uppercase text-right">
            {selectedMotions.length} Motion Profiles Active
          </div>
        </div>
        <div className="flex flex-col justify-between h-full py-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Active Synthesis</label>
            <div className="text-3xl font-mono font-bold text-white flex items-baseline gap-2">
              {scenes.length} <span className="text-sm font-normal text-indigo-400 italic">Sequences</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setScenes([]); setScript(''); }}
              className="p-2 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all rounded"
              id="clear-btn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {scenes.length > 0 && (
              <button 
                onClick={exportCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded transition-all"
                id="export-btn"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/20">
        {/* Grid Headers */}
        <div className="grid grid-cols-[100px_1fr_1.5fr_1.5fr] bg-slate-900 border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 sticky top-0 z-20">
          <div className="p-3 pl-8 flex items-center justify-center">ID</div>
          <div className="p-3 pl-6 border-l border-slate-800 flex items-center gap-2">
            <Type className="w-3 h-3 text-indigo-500" /> Script Segment
          </div>
          <div className="p-3 pl-6 border-l border-slate-800 flex items-center gap-2">
            <ImageIcon className="w-3 h-3 text-indigo-500" /> Starting Image [STYLE]
          </div>
          <div className="p-3 pl-6 border-l border-slate-800 flex items-center gap-2">
            <MonitorPlay className="w-3 h-3 text-indigo-500" /> Video Motion Description
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-800/10">
          <AnimatePresence mode="popLayout">
            {scenes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-32 text-center"
              >
                <div className="w-20 h-20 bg-slate-800/50 border border-slate-700/50 flex items-center justify-center rounded-3xl mb-6 relative group">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                  <Settings className="w-10 h-10 text-slate-600 animate-[spin_12s_linear_infinite] relative" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Engine Initialization Pending</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed italic">
                  Feed the generator with a script and a visual anchor to synthesize your scene sequence prompts.
                </p>
              </motion.div>
            ) : (
              scenes.map((scene, idx) => (
                <motion.div
                  key={scene.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`grid grid-cols-[100px_1fr_1.5fr_1.5fr] group transition-all duration-200 border-b border-slate-800/30 ${
                    idx % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0F172A]'
                  } hover:bg-slate-800/50`}
                >
                  <div className="p-6 flex items-center justify-center">
                    <span className="font-mono text-[11px] text-slate-500 tracking-wider group-hover:text-indigo-400 transition-colors">
                      {String(idx + 1).padStart(3, '0')}
                    </span>
                  </div>
                  
                  <div className="p-6 border-l border-slate-800/50 relative group/cell">
                    <div className={`border-l-2 ${idx % 3 === 0 ? 'border-indigo-500' : 'border-slate-700'} pl-4 h-full flex flex-col justify-center`}>
                      <p className="text-[13px] text-slate-300 leading-relaxed italic">{scene.scriptSegment}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(scene.scriptSegment)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-6 border-l border-slate-800/50 relative group/cell flex flex-col justify-center">
                    <p className="text-[13px] text-slate-400 leading-relaxed font-sans">{scene.imagePrompt}</p>
                    <div className="mt-3 p-2 bg-red-950/20 border border-red-500/10 rounded text-[11px] text-red-300/40 italic leading-tight">
                      Neg: {scene.negativePrompt}
                    </div>
                    <button 
                      onClick={() => handleCopy(scene.imagePrompt)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <div className="mt-4 flex gap-2">
                       <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">IMAGE_GEN</span>
                    </div>
                  </div>

                  <div className="p-6 border-l border-slate-800/50 relative group/cell flex flex-col justify-center">
                    <p className="text-[13px] text-indigo-300/80 leading-relaxed font-sans">{scene.videoPrompt}</p>
                    <button 
                      onClick={() => handleCopy(scene.videoPrompt)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <div className="mt-4 flex gap-2 items-center">
                       <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">MOTION_PATH</span>
                       <span className="text-[9px] text-slate-500 font-mono tracking-tighter">
                         {(idx * secondsPerScene).toFixed(1)}s - {((idx + 1) * secondsPerScene).toFixed(1)}s
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Status Footer */}
      <footer className="px-6 py-2.5 bg-[#1E293B] border-t border-slate-700/50 flex justify-between items-center z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              System {isGenerating ? 'Active' : 'Ready'}: API Connected
            </span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <div className="text-[10px] text-slate-500 font-mono">
            ENGINE: <span className="text-indigo-400">GEMINI_3_FLASH</span> // MODE: <span className="text-white">BATCH_SYNTHESIS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-medium">Render Estimate: {scenes.length > 0 ? (scenes.length * 0.5).toFixed(1) + ' min' : '--'}</span>
          <div className="h-2 w-2 rounded-full border border-slate-700 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-slate-700 opacity-20"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
