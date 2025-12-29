import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Code, PencilRuler, MessageSquare, Users, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    id: 1,
    icon: Code,
    title: "Real-Time Code Editor",
    description: "Collaborate on code with live editing, syntax highlighting, and instant synchronization across all connected users.",
    highlights: ["Monaco Editor (VS Code engine)", "Multi-language support", "Live cursor tracking", "Syntax highlighting"],
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    id: 2,
    icon: PencilRuler,
    title: "Interactive Whiteboard",
    description: "Draw diagrams, flowcharts, and visual explanations to better communicate your ideas and code concepts.",
    highlights: ["Drawing tools & shapes", "Multiple colors", "Real-time collaboration", "Export as PNG"],
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    id: 3,
    icon: Play,
    title: "Code Execution Engine",
    description: "Run your code instantly with support for Java, Python, C++, and JavaScript. See results in real-time.",
    highlights: ["Multi-language execution", "Instant feedback", "Error handling", "Secure sandboxing"],
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10"
  }
];

export default function FeaturesShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentFeature = features[currentSlide];
  const IconComponent = currentFeature.icon;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Feature Display */}
      <div className={`relative bg-gradient-to-br ${currentFeature.bgGradient} rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm transition-all duration-500`}>
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-black/20 hover:bg-black/40 text-white border-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-black/20 hover:bg-black/40 text-white border-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Feature Content */}
        <div className="text-center mb-6">
          <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${currentFeature.gradient} mb-4`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentFeature.title}
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {currentFeature.description}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {currentFeature.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentFeature.gradient}`}></div>
              {highlight}
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? `bg-gradient-to-r ${currentFeature.gradient}` 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feature Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-2xl font-bold text-blue-400">4+</div>
          <div className="text-xs text-slate-400">Languages</div>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-2xl font-bold text-green-400">∞</div>
          <div className="text-xs text-slate-400">Collaborators</div>
        </div>
        <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-2xl font-bold text-purple-400">24/7</div>
          <div className="text-xs text-slate-400">Available</div>
        </div>
      </div>

      {/* Additional Features List */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          More Features
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Live Chat
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            Instant Execution
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            User Presence
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-3 h-3" />
            Theme Support
          </div>
        </div>
      </div>
    </div>
  );
}