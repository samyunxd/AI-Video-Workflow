import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Zap, Shield, Globe, MousePointer2, LogIn, LayoutDashboard } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';

interface LandingPageProps {
  onEnterStudio: () => void;
}

export default function LandingPage({ onEnterStudio }: LandingPageProps) {
  const { user } = useAuth();

  const handleAction = async () => {
    if (user) {
      onEnterStudio();
    } else {
      try {
        await signInWithGoogle();
        onEnterStudio();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Decorative Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] bg-indigo-500/10 rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] bg-purple-500/10 rounded-full" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CinePrompt</span>
        </div>
        <button 
          onClick={handleAction}
          className="px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
        >
          {user ? (
            <>
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Get Started
            </>
          )}
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
        {/* Hero Section */}
        <section className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              AI Powered Video Workflow Generator
            </span>
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              DIRECT YOUR <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">VISION WITH AI</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-12">
              The professional workflow engine for AI filmmakers. Bridge the gap between scripting and cinematic generation with intelligent prompt expansion and workspace management.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleAction}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
              >
                {user ? 'Enter Studio Hub' : 'Launch Studio'}
                <Zap className="w-5 h-5" />
              </button>
              <a 
                href="#about"
                className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 tracking-tight">About CinePrompt</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                CinePrompt was designed to solve the "blank page" problem in AI video production. While tools like Sora and Runway are powerful, they require precise, detailed prompting to yield cinematic results.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our platform acts as your virtual Assistant Director, taking raw scripts and expanding them into technical, professional prompts that include lighting data, camera movements, and director's notes.
              </p>
            </div>
            <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <span className="block text-2xl font-bold text-white mb-2">95%</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Expansion Rate</span>
              </div>
              <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                <span className="block text-2xl font-bold text-white mb-2">Instant</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Cloud Sync</span>
              </div>
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <span className="block text-2xl font-bold text-white mb-2">24/7</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">AI Availability</span>
              </div>
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <span className="block text-2xl font-bold text-white mb-2">Zero</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Data Loss</span>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold mb-12 text-center tracking-tight">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-900/50 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
              <div className="text-5xl font-bold text-indigo-500/10 absolute top-4 right-4 group-hover:scale-110 transition-transform">01</div>
              <h3 className="text-xl font-bold mb-4">Create Workspace</h3>
              <p className="text-slate-400 text-sm">Start by creating a dedicated workspace. Customize it with a logo and ambient color that matches your project's mood.</p>
            </div>
            <div className="p-8 bg-slate-900/50 border border-purple-500/20 rounded-3xl relative overflow-hidden group">
              <div className="text-5xl font-bold text-purple-500/10 absolute top-4 right-4 group-hover:scale-110 transition-transform">02</div>
              <h3 className="text-xl font-bold mb-4">Input Script</h3>
              <p className="text-slate-400 text-sm">Paste your raw ideas or full screenplays. Select your preferred cinematic style, motion types, and shot compositions.</p>
            </div>
            <div className="p-8 bg-slate-900/50 border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
              <div className="text-5xl font-bold text-emerald-500/10 absolute top-4 right-4 group-hover:scale-110 transition-transform">03</div>
              <h3 className="text-xl font-bold mb-4">Generate & Sync</h3>
              <p className="text-slate-400 text-sm">Hit generate to see your script transform into actionable AI prompts. Everything is synced to the cloud in real-time.</p>
            </div>
          </div>
        </section>

        {/* Whom to Use / What to Use Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
          <div className="md:col-span-7 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <MousePointer2 className="text-indigo-400" />
                Whom to use
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-bold text-indigo-300">Indie Filmmakers</h4>
                  <p className="text-slate-500 text-sm">Prototyping scenes and storyboards before high-cost production.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300">Content Creators</h4>
                  <p className="text-slate-500 text-sm">Rapidly generating consistent visual prompts for social media campaigns.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300">Ad Agencies</h4>
                  <p className="text-slate-500 text-sm">Creating high-fidelity pitch decks with AI-assisted visualizations.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300">Writers</h4>
                  <p className="text-slate-500 text-sm">Seeing their narrative text translated into director-ready technical notes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-indigo-500/10 rounded-3xl p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold mb-6">What to use</h3>
              <p className="text-slate-400 mb-8">CinePrompt integrates with the most advanced AI models to provide a seamless output for your next production.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">G</div>
                  <span>Gemini Flash/Pro for Prompt Intelligence</span>
                </li>
                <li className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">F</div>
                  <span>Firebase Real-time Infrastructure</span>
                </li>
                <li className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400">V</div>
                  <span>Vite + React for High-Performance UI</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section id="how-it-works" className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-32">
          <div className="md:col-span-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-10 overflow-hidden relative group">
            <div className="relative z-10 max-w-md">
              <Sparkles className="w-10 h-10 text-indigo-500 mb-6" />
              <h3 className="text-3xl font-bold mb-4">Prompt Engineering Reinvented</h3>
              <p className="text-slate-400">
                Our smart engine automatically expands your vision into high-fidelity cinematic prompts, optimizing for lighting, camera motion, and shot composition.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-10 flex flex-col justify-between">
            <Zap className="w-10 h-10 text-purple-500 mb-6" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Cloud Sync</h3>
              <p className="text-slate-500 text-sm">
                Every project is synced in real-time. Pick up where you left off on any device.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-10">
            <Shield className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Private & Secure</h3>
            <p className="text-slate-500 text-sm">
              Your data is yours. We use enterprise-grade encryption to protect your creative assets.
            </p>
          </div>

          <div className="md:col-span-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-10 flex items-center justify-between">
            <div className="max-w-xs">
              <h3 className="text-3xl font-bold mb-4">Ecosystem</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Independent AI Filmmakers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Content Strategy Agencies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Creative Directors
                </li>
              </ul>
            </div>
            <div className="hidden lg:block w-48 h-48 bg-indigo-500/5 rounded-full border border-indigo-500/10 flex items-center justify-center p-8">
              <Globe className="w-full h-full text-indigo-500/20" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 rounded-[40px] p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-8">Ready to direct?</h2>
            <button 
              onClick={handleAction}
              className="px-12 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-black/20"
            >
              {user ? 'Open Your Workspaces' : 'Sign up with Google'}
            </button>
            <p className="mt-8 text-indigo-200 text-sm font-medium">Free to start. No credit card required.</p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-900 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <Play className="w-3 h-3 fill-slate-400" />
            </div>
            <span className="font-bold text-sm tracking-tight">CinePrompt Studio</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-xs font-medium uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-slate-600 text-xs">© 2026 CinePrompt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
