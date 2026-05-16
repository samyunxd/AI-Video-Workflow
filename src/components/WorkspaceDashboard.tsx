import React from 'react';
import { 
  Plus, 
  Folder, 
  Clock, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Search,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Workspace } from '../types';

interface WorkspaceDashboardProps {
  workspaces: Workspace[];
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSelect: (workspace: Workspace) => void;
  onCreate: (name: string, description: string, logo: string, themeColor: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, description: string, logo: string, themeColor: string) => void;
}

export default function WorkspaceDashboard({ 
  workspaces, 
  apiKey,
  onApiKeyChange,
  onSelect, 
  onCreate, 
  onDelete,
  onUpdate
}: WorkspaceDashboardProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = React.useState<Workspace | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = React.useState('');
  const [editingWorkspace, setEditingWorkspace] = React.useState<Workspace | null>(null);
  const [formName, setFormName] = React.useState('');
  const [formDesc, setFormDesc] = React.useState('');
  const [formLogo, setFormLogo] = React.useState('');
  const [formColor, setFormColor] = React.useState('#6366F1');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const extractDominantColor = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#6366F1');
          return;
        }
        
        // Resize for faster processing
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        
        try {
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0;
          let count = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            // Ignore transparent or near-black/near-white pixels
            if (data[i+3] < 128) continue;
            const brightness = (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
            if (brightness < 30 || brightness > 230) continue;
            
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
          
          if (count === 0) {
            resolve('#6366F1');
            return;
          }

          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          // Convert to hex
          const toHex = (c: number) => c.toString(16).padStart(2, '0');
          resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
        } catch (e) {
          resolve('#6366F1');
        }
      };
      img.onerror = () => resolve('#6366F1');
      img.src = imageUrl;
    });
  };

  React.useEffect(() => {
    const updateColor = async () => {
      if (formLogo && (formLogo.startsWith('data:') || formLogo.startsWith('http'))) {
        const color = await extractDominantColor(formLogo);
        setFormColor(color);
      } else {
        setFormColor('#6366F1');
      }
    };
    updateColor();
  }, [formLogo]);

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleOpenCreate = () => {
    setEditingWorkspace(null);
    setFormName(`Workspace ${workspaces.length + 1}`);
    setFormDesc('');
    setFormLogo('');
    setFormColor('#6366F1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setFormName(ws.name);
    setFormDesc(ws.description || '');
    setFormLogo(ws.logo || '');
    setFormColor(ws.themeColor || '#6366F1');
    setIsModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for local storage safety
        alert('Image too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDelete = (ws: Workspace) => {
    setWorkspaceToDelete(ws);
    setDeleteConfirmInput('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workspaceToDelete && deleteConfirmInput === 'DELETE') {
      onDelete(workspaceToDelete.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingWorkspace) {
      onUpdate(editingWorkspace.id, formName, formDesc, formLogo, formColor);
    } else {
      onCreate(formName, formDesc, formLogo, formColor);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0F172A] overflow-hidden relative">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1E293B] border border-red-500/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">Delete Workspace?</h2>
              <p className="text-slate-400 text-sm mb-8 text-center px-4">
                This action is permanent. You are deleting <span className="text-white font-bold">"{workspaceToDelete?.name}"</span> and all its sequences.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-3 text-center tracking-[0.2em]">
                    Type <span className="text-red-400">DELETE</span> to confirm
                  </label>
                  <input 
                    autoFocus
                    type="text" 
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    className="w-full bg-[#0F172A] border border-red-500/20 rounded-xl px-4 py-4 text-center text-red-400 font-bold tracking-widest outline-none focus:border-red-500/50 transition-all placeholder:text-slate-800"
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={deleteConfirmInput !== 'DELETE'}
                    onClick={handleConfirmDelete}
                    className={`flex-1 px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      deleteConfirmInput === 'DELETE' 
                        ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-500/20' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workspace Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1E293B] border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
                {editingWorkspace ? 'Edit Workspace' : 'Create Workspace'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Workspace Logo</label>
                  <div className="flex items-center gap-6 mb-6 p-4 bg-[#0F172A] rounded-2xl border border-slate-800/50">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-700/50">
                      {formLogo ? (
                        <img src={formLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Layout className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Detected Ambient</span>
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse" 
                            style={{ backgroundColor: formColor }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            Upload Image
                          </button>
                          {formLogo && (
                            <button
                              type="button"
                              onClick={() => setFormLogo('')}
                              className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg text-xs font-bold transition-all"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formLogo.startsWith('data:') ? '' : formLogo}
                          onChange={(e) => setFormLogo(e.target.value)}
                          className="w-full bg-[#1E293B] border border-slate-700/50 rounded-lg px-3 py-2 text-[11px] text-slate-400 outline-none focus:border-indigo-500 transition-all font-mono"
                          placeholder="Or paste image URL..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                    placeholder="e.g., Summer Campaign"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Description</label>
                  <textarea 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all h-24 resize-none text-sm leading-relaxed"
                    placeholder="What's this workflow for?"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {editingWorkspace ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Your Workspaces</h1>
              <p className="text-slate-400 text-sm">Manage your video AI generation projects in one place.</p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Workspace
            </button>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col xl:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search workspaces..." 
                className="w-full bg-[#1E293B] border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {workspaces.length > 0 && (
              <div className="flex gap-4">
                <div className="bg-[#1E293B] border border-slate-700/50 px-6 py-3 rounded-xl flex items-center gap-3">
                  <Layout className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-300">{workspaces.length} Projects</span>
                </div>
              </div>
            )}
           </div>
          </div>

          {/* Grid */}
          {filteredWorkspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
              <Folder className="w-16 h-16 text-slate-700 mb-6" />
              <h3 className="text-white font-semibold text-lg mb-2">No workspaces found</h3>
              <p className="text-slate-500 text-sm mb-8">Create your first workspace to start generating video prompts.</p>
              <button 
                onClick={handleOpenCreate}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Build something new
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((ws) => (
                <motion.div
                  key={ws.id}
                  layoutId={ws.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-6 group hover:border-indigo-500/50 transition-all cursor-pointer relative flex flex-col h-full overflow-hidden"
                  onClick={() => onSelect(ws)}
                  style={{
                    boxShadow: `0 0 60px -20px ${ws.themeColor || '#6366F1'}66`,
                    background: `linear-gradient(135deg, #1E293B 0%, #111827 100%)`,
                  } as any}
                >
                  {/* Ambient Glow Gradient Layer */}
                  <div 
                    className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle at 50% 0%, ${ws.themeColor || '#6366F1'}ff, transparent 80%)`,
                    }}
                  />

                  {/* Spider Web Pattern Overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.15] group-hover:opacity-[0.25] transition-all duration-700 pointer-events-none"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='${encodeURIComponent(ws.themeColor || '#6366F1')}' stroke-width='0.5' fill='none'%3E%3Cpath d='M50 50 L100 50 M50 50 L85.35 85.35 M50 50 L50 100 M50 50 L14.65 85.35 M50 50 L0 50 M50 50 L14.65 14.65 M50 50 L50 0 M50 50 L85.35 14.65' /%3E%3Ccircle cx='50' cy='50' r='15' /%3E%3Ccircle cx='50' cy='50' r='30' /%3E%3Ccircle cx='50' cy='50' r='45' /%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '100px 100px',
                      maskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 90%)'
                    }}
                  />
                  
                  {/* Secondary Ambient Light */}
                  <div 
                    className="absolute -top-24 -left-24 w-64 h-64 blur-[80px] opacity-[0.15] group-hover:opacity-[0.3] transition-opacity duration-700 rounded-full pointer-events-none"
                    style={{ backgroundColor: ws.themeColor || '#6366F1' }}
                  />

                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-12 h-12 bg-indigo-500/10 rounded-xl overflow-hidden flex items-center justify-center group-hover:bg-indigo-500/20 transition-all text-2xl border border-indigo-500/10 relative z-10"
                      style={{ 
                        borderColor: `${ws.themeColor}33`,
                        backgroundColor: `${ws.themeColor}1a`
                      }}
                    >
                      {ws.logo ? (
                        <img src={ws.logo} alt={ws.name} className="w-full h-full object-cover" />
                      ) : (
                        <Layout className="w-6 h-6" style={{ color: ws.themeColor || '#818CF8' }} />
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(ws);
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all focus:ring-2 ring-indigo-500 outline-none"
                        title="Edit Workspace Details"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDelete(ws);
                        }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all focus:ring-2 ring-red-500 outline-none"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight line-clamp-1">{ws.name}</h3>
                    {ws.description && (
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed italic">{ws.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 opacity-60">
                      <Clock className="w-3 h-3" />
                      <span>Updated {new Date(ws.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-auto border-t border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Engine</span>
                      <span className="text-xs text-slate-300 font-mono tracking-tight">{ws.data.engine}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Scenes</span>
                      <span className="text-xs text-indigo-400 font-bold">{ws.data.scenes.length}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-8 py-4 bg-[#1E293B]/50 border-t border-slate-700/50 text-center">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
          AI Video Workflow Engine v2.0 • Advanced Multi-Workspace Management
        </p>
      </div>
    </div>
  );
}
