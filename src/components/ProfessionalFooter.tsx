import { Github, Linkedin, MessageCircle, Code } from "lucide-react";

export default function ProfessionalFooter() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CodeSphere
              </h3>
              <p className="text-slate-400 mt-1">
                Real-Time Collaborative Code Editor • Java-first approach
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/abhishekgiri04" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
            >
              <Github className="w-6 h-6 text-slate-400 group-hover:text-white" />
              <span className="text-slate-400 group-hover:text-white font-medium">GitHub</span>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/abhishek-giri04/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              <Linkedin className="w-6 h-6 text-white" />
              <span className="text-white font-medium">LinkedIn</span>
            </a>
            
            <a 
              href="https://t.me/AbhishekGiri7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Telegram</span>
            </a>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-10 pt-8 border-t border-slate-700/50 text-center">
          <p className="text-slate-400 text-lg">
            Built with <Code className="w-5 h-5 text-red-400 inline mx-1" /> for collaborative coding by{" "}
            <span className="text-blue-400 font-semibold">Abhishek Giri</span>
          </p>
          <p className="text-slate-500 text-sm mt-3">
            © 2025 CodeSphere. Transforming Remote Development Through Real-Time Collaboration.
          </p>
        </div>
      </div>
    </footer>
  );
}