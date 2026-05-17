import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Zap, Shield, Globe, MousePointer2, LogIn, LayoutDashboard, Film, Camera, Move, Layers } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';
import logoImg from '../assets/images/aidirector_logo_1779010645596.png';

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
        // Note: In AI Studio preview, if popups fail, the user might need to open in a new tab.
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white overflow-hidden selection:bg-indigo-500/30 relative">
      {/* Refined Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_70%)] opacity-25" />
        <div className="absolute inset-0 bg-[#0A0D14]" />
        
        {/* Subtle Static Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] bg-indigo-900/10 rounded-full opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] bg-slate-900/10 rounded-full opacity-20" />
        
        {/* Precise Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-10 py-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
            <img src={logoImg} alt="AiDirector Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white/90">AiDirector</span>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
        >
          <button 
            onClick={handleAction}
            className="px-5 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            {user ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </motion.div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-24 pb-32">
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-48"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
              System v3.0 // Ready for Production
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-12"
          >
            THE OPERATING SYSTEM <br/>
            <span className="text-white/30">FOR AI FILMMAKING</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-14 leading-relaxed font-normal"
          >
            Professional infrastructure for prompt architecture and cinematic workflow management. Scale your local vision into international production with AiDirector.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={handleAction}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              Get Started Free
              <Zap className="w-4 h-4" />
            </button>
            <a 
              href="#about"
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all backdrop-blur-sm"
            >
              View Capabilities
            </a>
          </motion.div>
        </motion.section>

        {/* Refined Mockup */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="relative mb-48 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/20"
        >
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             <div className="ml-4 h-4 w-32 bg-white/5 rounded" />
          </div>
          <div className="aspect-[16/9] bg-[#050505] p-8 grid grid-cols-12 gap-6">
            <div className="col-span-3 space-y-6">
               <div className="h-12 bg-white/5 rounded-lg" />
               <div className="space-y-3">
                 <div className="h-3 w-full bg-white/5 rounded" />
                 <div className="h-3 w-4/5 bg-white/5 rounded" />
                 <div className="h-3 w-3/4 bg-white/5 rounded" />
               </div>
            </div>
            <div className="col-span-9 bg-white/5 rounded-2xl border border-white/5 p-8 flex items-center justify-center">
               <Sparkles className="w-12 h-12 text-white/10" />
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <section id="about" className="mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold tracking-tight">Technical Bridge for <br/>Creative Visions</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                We remove the abstraction between script and screen. AiDirector provides a robust technical suite to automate cinematic variables—from lens metadata to lighting environments.
              </p>
              <div className="grid gap-4">
                 {[
                   { icon: <Camera className="w-4 h-4" />, text: "Automated Lens & Lighting Control" },
                   { icon: <Move className="w-4 h-4" />, text: "Sophisticated Motion Architectures" },
                   { icon: <Layers className="w-4 h-4" />, text: "Unified Project Workspace Sync" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 text-slate-300 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                     {item.icon}
                     <span className="text-sm font-medium tracking-tight">{item.text}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="block text-3xl font-bold mb-2 tracking-tight">95%</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Expansion Engine</span>
              </div>
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="block text-3xl font-bold mb-2 tracking-tight">Real</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Time Sync</span>
              </div>
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="block text-3xl font-bold mb-2 tracking-tight">Zero</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Latency Hub</span>
              </div>
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="block text-3xl font-bold mb-2 tracking-tight">Full</span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Data Control</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-48">
          <h2 className="text-3xl font-bold mb-16 text-center tracking-tight">System Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: "01", title: "Initialize Hub", text: "Establish parameters for your production environment and styles." },
              { id: "02", title: "Map Narratives", text: "Bridge scripts with technical metadata and lens configurations." },
              { id: "03", title: "Execute Generation", text: "Deploy precise prompt architectures to generation engines." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="text-xs font-black text-indigo-500 mb-6 tracking-[0.3em] uppercase">{step.id} / Workflow</div>
                <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Detailed Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-48">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-white/[0.02] border border-white/5 rounded-3xl p-12"
          >
            <h3 className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Intelligence Layer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-white font-bold tracking-tight">Narrative Analysis</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Extracting technical requirements from raw narrative text using advanced LLM architectures.</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold tracking-tight">Style Consistency</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Ensuring consistent aesthetic tokens across multi-scene production workflows.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-12 flex flex-col justify-between"
          >
            <Shield className="w-6 h-6 text-slate-500 mb-8" />
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Privacy First</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Enterprise-grade encryption for all creative assets and prompt IP.</p>
            </div>
          </motion.div>
        </section>

        {/* Simplified CTA */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white text-black rounded-3xl p-20 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight">Join the next generation <br/>of digital cinema.</h2>
            <button 
              onClick={handleAction}
              className="px-12 py-5 bg-black text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-3 mx-auto"
            >
              {user ? 'Enter Studio' : 'Begin Production'}
              <Zap className="w-4 h-4 fill-white" />
            </button>
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-24 px-10 bg-[#070A0F]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 overflow-hidden rounded bg-white/5 border border-white/10 flex items-center justify-center p-1">
                 <img src={logoImg} alt="AiDirector Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white/90">AiDirector</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-medium">Professional grade infrastructure for AI-augmented production environments.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] text-white font-bold uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2 text-slate-500 text-xs font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Workspace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Keys</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] text-white font-bold uppercase tracking-widest">Company</h4>
              <ul className="space-y-2 text-slate-500 text-xs font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex justify-between items-center">
          <p className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em]">© 2026 AiDirector Systems • All Rights Reserved</p>
          <div className="flex gap-6">
             <Globe className="w-4 h-4 text-slate-700 hover:text-white cursor-pointer transition-colors" />
             <Zap className="w-4 h-4 text-slate-700 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
