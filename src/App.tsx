/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Zap,
  Home,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';
import { generateBulkPrompts, ScenePrompt } from './services/gemini';
import { Workspace, WorkspaceData } from './types';
import WorkspaceDashboard from './components/WorkspaceDashboard';

const DEFAULT_DATA: WorkspaceData = {
  script: '',
  style: 'Cinematic, hyper-realistic, 8k, anamorphic lens flares, dramatic lighting, highly detailed textures',
  negativePrompt: 'blurry, low quality, distorted, deformed, text, watermarks, bad anatomy, simple background',
  secondsPerScene: 5,
  wordsPerSecond: 2,
  multiview: false,
  strictImage: false,
  promptInstructions: '',
  promptMode: 'Structured Prompt',
  engine: 'Gemini',
  selectedMotions: ['Static Camera', 'Pan Right', 'Tilt Down', 'Zoom In', 'Tracking Shot'],
  selectedShotTypes: ['Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Low Angle', 'High Angle'],
  scenes: []
};

const DEFAULT_THEME_COLOR = '#6366F1';

export default function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('v2_workspaces');
    if (saved) return JSON.parse(saved);
    
    // Legacy migration or initial setup
    const legacyWorkspace: Workspace = {
      id: 'default',
      name: 'Default Workspace',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        script: localStorage.getItem('cb_script') || '',
        style: localStorage.getItem('cb_style') || DEFAULT_DATA.style,
        negativePrompt: localStorage.getItem('cb_neg') || DEFAULT_DATA.negativePrompt,
        secondsPerScene: Number(localStorage.getItem('cb_sec')) || 5,
        wordsPerSecond: Number(localStorage.getItem('cb_wps')) || 2,
        multiview: localStorage.getItem('cb_mv') === 'true',
        strictImage: localStorage.getItem('cb_strict') === 'true',
        promptInstructions: localStorage.getItem('cb_pi') || '',
        promptMode: localStorage.getItem('cb_pm') || 'Structured Prompt',
        engine: localStorage.getItem('cb_eng') || 'Gemini',
        selectedMotions: JSON.parse(localStorage.getItem('cb_motions') || 'null') || DEFAULT_DATA.selectedMotions,
        selectedShotTypes: JSON.parse(localStorage.getItem('cb_shots') || 'null') || DEFAULT_DATA.selectedShotTypes,
        scenes: JSON.parse(localStorage.getItem('cb_scenes') || 'null') || []
      }
    };
    return [legacyWorkspace];
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('global_gemini_key') || '');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeWorkspace = useMemo(() => 
    workspaces.find(w => w.id === activeWorkspaceId), 
    [workspaces, activeWorkspaceId]
  );

  // Persistence
  useEffect(() => {
    localStorage.setItem('v2_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('global_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  const updateActiveWorkspace = (updates: Partial<WorkspaceData>) => {
    if (!activeWorkspaceId) return;
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === activeWorkspaceId) {
        return {
          ...ws,
          updatedAt: Date.now(),
          data: { ...ws.data, ...updates }
        };
      }
      return ws;
    }));
  };

  const handleCreateWorkspace = (name: string, description: string, logo?: string, themeColor?: string) => {
    const id = crypto.randomUUID();
    const newWs: Workspace = {
      id,
      name,
      description,
      logo,
      themeColor: themeColor || DEFAULT_THEME_COLOR,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: { ...DEFAULT_DATA }
    };
    setWorkspaces([newWs, ...workspaces]);
    setActiveWorkspaceId(id);
    toast.success(`Created "${name}"`);
  };

  const handleUpdateWorkspace = (id: string, name: string, description: string, logo?: string, themeColor?: string) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === id ? { ...ws, name, description, logo, themeColor, updatedAt: Date.now() } : ws
    ));
    toast.success("Workspace updated");
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (activeWorkspaceId === id) setActiveWorkspaceId(null);
    toast.info("Workspace deleted");
  };

  const handleGenerate = async () => {
    if (!activeWorkspace) return;
    const { script, style, secondsPerScene, multiview, negativePrompt, wordsPerSecond, selectedMotions, strictImage, selectedShotTypes, promptInstructions, promptMode, engine } = activeWorkspace.data;

    if (!script.trim()) {
      toast.error("Script is empty. Please provide a script first.");
      setError("Please provide a script.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    const toastId = toast.loading("Synthesizing script into visual beats...");

    try {
      const results = await generateBulkPrompts(
        script, 
        style, 
        secondsPerScene, 
        multiview, 
        negativePrompt, 
        geminiApiKey, 
        wordsPerSecond,
        selectedMotions,
        strictImage,
        selectedShotTypes,
        promptInstructions,
        promptMode,
        engine
      );
      updateActiveWorkspace({ scenes: results });
      toast.success(`Successfully generated ${results.length} sequences`, { id: toastId });
    } catch (err: any) {
      const errorMsg = err.message || "Failed to generate prompts. Please try again.";
      setError(errorMsg);
      toast.error("Generation failed", { 
        id: toastId,
        description: errorMsg 
      });
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      duration: 1500,
      icon: <Copy className="w-3 h-3" />
    });
  };

  const exportExcel = () => {
    if (!activeWorkspace) return;
    const { scenes } = activeWorkspace.data;
    try {
      const exportData: any[] = [];
      
      scenes.forEach((s, index) => {
        exportData.push({
          'SEQUENCE ID': s.id || String(index + 1).padStart(3, '0'),
          'SCRIPT SEGMENT': s.scriptSegment,
          'IMAGE PROMPT & NEGATIVE': `${s.imagePrompt}${s.negativePrompt ? ` [NEG: ${s.negativePrompt}]` : ''}`,
          'VIDEO MOTION & ACTION': s.videoPrompt
        });
        
        if (index < scenes.length - 1) {
          exportData.push({
            'SEQUENCE ID': '',
            'SCRIPT SEGMENT': '',
            'IMAGE PROMPT & NEGATIVE': '',
            'VIDEO MOTION & ACTION': ''
          }); 
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const wscols = [
        { wch: 15 }, 
        { wch: 50 }, 
        { wch: 85 }, 
        { wch: 65 }, 
      ];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Video Workflow");
      XLSX.writeFile(workbook, `AI_Video_Workflow_${activeWorkspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`);
      
      toast.success("Excel export complete");
    } catch (err) {
      toast.error("Excel export failed");
      console.error(err);
    }
  };

  const motionOptions = [
    'Static Camera', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out', 'Tracking Shot', 'Crane Shot', 'Handheld Shake'
  ];

  const shotTypeOptions = [
    'Extreme Wide Shot', 'Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'Low Angle', 'High Angle', 'Bird\'s Eye View', 'Worm\'s Eye View', 'Over-the-Shoulder', 'Point of View (POV)'
  ];

  if (!activeWorkspaceId) {
    return (
      <div className="flex flex-col h-screen bg-[#0F172A] text-slate-200 font-sans">
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          toastOptions={{
            style: { background: '#1E293B', border: '1px solid #334155', color: '#E2E8F0' },
          }}
          richColors
        />
        <header className="flex items-center justify-between px-8 py-6 bg-[#1B253B] border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">AI Video Workflow</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Studio Hub v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2 gap-3 focus-within:border-indigo-500/50 transition-all">
              <div className="flex flex-col">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Gemini API Key</label>
                <input 
                  type="password"
                  placeholder="Enter API Key..."
                  className="bg-transparent text-xs text-indigo-400 outline-none w-48 placeholder:text-slate-700 font-mono"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">Gemini Flash 3</span>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Connection Active</span>
            </div>
          </div>
        </header>

        <WorkspaceDashboard 
          workspaces={workspaces}
          apiKey={geminiApiKey}
          onApiKeyChange={setGeminiApiKey}
          onCreate={handleCreateWorkspace}
          onDelete={handleDeleteWorkspace}
          onUpdate={handleUpdateWorkspace}
          onSelect={(ws) => setActiveWorkspaceId(ws.id)}
        />
      </div>
    );
  }

  const { script, style, negativePrompt, secondsPerScene, wordsPerSecond, multiview, strictImage, promptInstructions, promptMode, engine, selectedMotions, selectedShotTypes, scenes } = activeWorkspace.data;

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        toastOptions={{
          style: { background: '#1E293B', border: '1px solid #334155', color: '#E2E8F0' },
          className: 'font-sans'
        }}
        expand={false}
        richColors
      />
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1E293B] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveWorkspaceId(null)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {activeWorkspace.name}
              <span className="text-[8px] font-normal text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full tracking-widest uppercase">Batch Workflow v2.0</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Video Synthesis Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5 gap-3 focus-within:border-indigo-500/50 transition-all">
            <div className="flex flex-col">
              <label className="text-[8px] uppercase font-bold text-slate-600 tracking-wider">API Key</label>
              <input 
                type="password"
                placeholder="Key..."
                className="bg-transparent text-[11px] text-indigo-400 outline-none w-32 placeholder:text-slate-800 font-mono"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className={`p-2 rounded border transition-all ${isConfigExpanded ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-indigo-600 border-indigo-500 text-white'}`}
            title={isConfigExpanded ? "Hide Settings" : "Show Settings"}
          >
            <Settings className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded shadow-sm">100+ Batch</button>
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
      <AnimatePresence>
        {isConfigExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-700/50 shrink-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-4 px-6 py-4 bg-[#1E293B]/50 items-start">
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">01. Script</label>
                <textarea 
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-[11px] text-slate-200 h-20 resize-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none placeholder:opacity-30 custom-scrollbar" 
                  placeholder="Paste script..."
                  value={script}
                  onChange={(e) => updateActiveWorkspace({ script: e.target.value })}
                  id="script-input"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">02. Style</label>
                <textarea 
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-[11px] text-indigo-300 h-20 resize-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none placeholder:opacity-30 custom-scrollbar" 
                  placeholder="Visual style..."
                  value={style}
                  onChange={(e) => updateActiveWorkspace({ style: e.target.value })}
                  id="style-input"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">03. Negative</label>
                <textarea 
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-[11px] text-red-300/60 h-20 resize-none transition-all focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10 outline-none placeholder:opacity-30 custom-scrollbar" 
                  placeholder="Exclusions..."
                  value={negativePrompt}
                  onChange={(e) => updateActiveWorkspace({ negativePrompt: e.target.value })}
                  id="negative-input"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">04. Instructions</label>
                <textarea 
                  value={promptInstructions}
                  onChange={(e) => updateActiveWorkspace({ promptInstructions: e.target.value })}
                  placeholder="Custom prompts rules..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-[11px] text-slate-300 h-20 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none custom-scrollbar placeholder:text-slate-700"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">05. Prompt Mode</label>
                <div className="grid grid-cols-1 gap-1">
                  {['General Image Prompt', 'Structured Prompt', 'Graphic Design', 'JSON'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateActiveWorkspace({ promptMode: mode })}
                      className={`text-left px-2 py-1 rounded text-[10px] transition-all border ${
                        promptMode === mode 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold' 
                          : 'bg-[#0F172A] border-slate-700 text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">06. Engine</label>
                <div className="grid grid-cols-2 gap-1">
                  {['Flux', 'Midjourney', 'Stable Diffusion', 'Gemini'].map((eng) => (
                    <button
                      key={eng}
                      onClick={() => updateActiveWorkspace({ engine: eng })}
                      className={`text-center py-1 rounded text-[10px] transition-all border ${
                        engine === eng 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold' 
                          : 'bg-[#0F172A] border-slate-700 text-slate-500'
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">07. Dynamics</label>
                <div className="relative group mb-2">
                  <select 
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-[11px] text-slate-300 outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-colors"
                    value={secondsPerScene}
                    onChange={(e) => updateActiveWorkspace({ secondsPerScene: Number(e.target.value) })}
                    id="duration-input"
                  >
                    <option value="3">3.0s</option>
                    <option value="4">4.0s</option>
                    <option value="5">5.0s</option>
                    <option value="8">8.0s</option>
                    <option value="12">12.0s</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.5" 
                      max="10"
                      className="w-10 bg-[#0F172A] border border-slate-700/50 rounded px-1 py-0.5 text-[10px] text-indigo-400 outline-none focus:border-indigo-500 transition-all font-mono"
                      value={wordsPerSecond}
                      onChange={(e) => updateActiveWorkspace({ wordsPerSecond: Number(e.target.value) })}
                    />
                    <span className="text-[8px] text-slate-500 font-mono">w/s</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => updateActiveWorkspace({ strictImage: !strictImage })}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded border transition-all ${strictImage ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
                      id="strict-toggle"
                    >
                      <Zap className="w-3 h-3" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Strict</span>
                    </button>
                    <button 
                      onClick={() => updateActiveWorkspace({ multiview: !multiview })}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded border transition-all ${multiview ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
                      id="multiview-toggle"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Multi</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">08. Camera</label>
                <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 h-20 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 gap-0.5">
                    {shotTypeOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-slate-800 rounded cursor-pointer transition-colors group">
                        <input 
                          type="checkbox" 
                          className="accent-indigo-500 w-2.5 h-2.5 rounded border-slate-600 bg-slate-900"
                          checked={selectedShotTypes.includes(opt)}
                          onChange={() => {
                            const next = selectedShotTypes.includes(opt) 
                              ? selectedShotTypes.filter(s => s !== opt) 
                              : [...selectedShotTypes, opt];
                            updateActiveWorkspace({ selectedShotTypes: next });
                          }}
                        />
                        <span className={`text-[9px] leading-tight ${selectedShotTypes.includes(opt) ? 'text-indigo-400' : 'text-slate-500'}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">09. Motion</label>
                <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-1.5 h-20 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 gap-0.5">
                    {motionOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-slate-800 rounded cursor-pointer transition-colors group">
                        <input 
                          type="checkbox" 
                          className="accent-indigo-500 w-2.5 h-2.5 rounded border-slate-600 bg-slate-900"
                          checked={selectedMotions.includes(opt)}
                          onChange={() => {
                            const next = selectedMotions.includes(opt) 
                              ? selectedMotions.filter(m => m !== opt) 
                              : [...selectedMotions, opt];
                            updateActiveWorkspace({ selectedMotions: next });
                          }}
                        />
                        <span className={`text-[9px] leading-tight ${selectedMotions.includes(opt) ? 'text-indigo-400' : 'text-slate-500'}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between h-24 py-1">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Status</label>
                  <div className="text-xl font-mono font-bold text-white flex items-baseline gap-1">
                    {scenes.length} <span className="text-[10px] font-normal text-indigo-400 italic">Seq</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => { 
                      updateActiveWorkspace({ scenes: [], script: '' });
                      toast.info("Workspace cleared");
                    }}
                    className="p-1.5 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all rounded"
                    title="Reset All"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {scenes.length > 0 && (
                    <button 
                      onClick={exportExcel}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all shadow-lg shadow-green-900/20"
                    >
                      <Download className="w-3 h-3" />
                      Export Excel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex-1 overflow-y-auto bg-slate-800/10 custom-scrollbar">
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
                  <div className="p-4 flex items-center justify-center">
                    <span className="font-mono text-[11px] text-slate-500 tracking-wider group-hover:text-indigo-400 transition-colors">
                      {String(idx + 1).padStart(3, '0')}
                    </span>
                  </div>
                  
                  <div className="p-4 border-l border-slate-800/50 relative group/cell">
                    <div className={`border-l-2 ${idx % 3 === 0 ? 'border-indigo-500' : 'border-slate-700'} pl-4 h-full flex flex-col justify-center`}>
                      <p className="text-[12px] text-slate-300 leading-relaxed italic">{scene.scriptSegment}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(scene.scriptSegment)}
                      className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="p-4 border-l border-slate-800/50 relative group/cell flex flex-col justify-center">
                    <p className="text-[12px] text-slate-400 leading-relaxed font-sans">
                      {scene.imagePrompt}
                      {scene.negativePrompt && (
                        <span className="text-red-400/80 ml-2 italic text-[11px]">
                          [NEG: {scene.negativePrompt}]
                        </span>
                      )}
                    </p>
                    <button 
                      onClick={() => handleCopy(`${scene.imagePrompt}${scene.negativePrompt ? ` --no ${scene.negativePrompt}` : ''}`)}
                      className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <div className="mt-2 flex gap-2">
                       <span className="text-[8px] bg-slate-900 text-slate-500 px-1 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">IMAGE_GEN</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l border-slate-800/50 relative group/cell flex flex-col justify-center">
                    <p className="text-[12px] text-indigo-300/80 leading-relaxed font-sans">{scene.videoPrompt}</p>
                    <button 
                      onClick={() => handleCopy(scene.videoPrompt)}
                      className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white shadow-xl"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <div className="mt-2 flex gap-2 items-center">
                       <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">MOTION_PATH</span>
                       <span className="text-[8px] text-slate-500 font-mono tracking-tighter">
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
