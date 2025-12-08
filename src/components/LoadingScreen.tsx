import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1.67; // 100/60 = 1.67 for 6 seconds
      });
    }, 100); // 100ms intervals for 6 seconds total

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      {/* Corner shapes */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      
      <img 
        src="https://static.wixstatic.com/media/b313a9_89ebec0c5f384c65a9551f0c1ec18ca9~mv2.gif" 
        alt="Loading..." 
        className="w-full h-full object-cover"
      />
    </div>
  );
}