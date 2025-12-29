import FeaturesShowcase from "@/components/FeaturesShowcase";
import AuthScreen from "@/components/AuthScreen";
import ProfessionalFooter from "@/components/ProfessionalFooter";

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse delay-1500"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center py-8">
        <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight">
          CodeSphere
        </h1>
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed text-center">
            Real-Time Collaborative Code Editor with Whiteboard & Instant Execution
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-400"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-500"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Split Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-300px)] gap-8 px-4 md:px-8">
        {/* Left Side - Features Showcase */}
        <div className="flex-1 flex items-center justify-center">
          <FeaturesShowcase />
        </div>
        
        {/* Right Side - Authentication */}
        <div className="flex-1 flex items-center justify-center">
          <AuthScreen />
        </div>
      </div>
      
      {/* Professional Footer */}
      <div className="relative z-10">
        <ProfessionalFooter />
      </div>
    </div>
  );
}
