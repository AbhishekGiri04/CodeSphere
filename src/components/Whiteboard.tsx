
import { useRef, useEffect, useState } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Square, 
  ArrowRight, 
  Type, 
  CircleDot, 
  Eraser, 
  MousePointer
} from "lucide-react";

export default function Whiteboard() {
  const { selectedTool, setSelectedTool } = useEditorContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Clear canvas initially
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };
  
  const startDrawing = (e: React.MouseEvent) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    
    if (selectedTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    } else if (selectedTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
    }
  };
  
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };
  
  const finishDrawing = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }
    
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'rectangle') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        x - startPoint.x,
        y - startPoint.y
      );
    } else if (selectedTool === 'arrow') {
      drawArrow(ctx, startPoint.x, startPoint.y, x, y);
    } else if (selectedTool === 'text') {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText('Text', x, y);
    } else if (selectedTool === 'flowchart') {
      drawFlowchartElement(ctx, startPoint.x, startPoint.y, x, y);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawFlowchartElement = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    const width = endX - startX;
    const height = endY - startY;
    
    ctx.beginPath();
    ctx.ellipse(
      startX + width / 2,
      startY + height / 2,
      Math.abs(width / 2),
      Math.abs(height / 2),
      0,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const tools = [
    { id: 'select', icon: <MousePointer className="w-5 h-5" />, tooltip: 'Select' },
    { id: 'pen', icon: <Pencil className="w-5 h-5" />, tooltip: 'Pen' },
    { id: 'rectangle', icon: <Square className="w-5 h-5" />, tooltip: 'Rectangle' },
    { id: 'arrow', icon: <ArrowRight className="w-5 h-5" />, tooltip: 'Arrow' },
    { id: 'text', icon: <Type className="w-5 h-5" />, tooltip: 'Text' },
    { id: 'flowchart', icon: <CircleDot className="w-5 h-5" />, tooltip: 'Flowchart' },
    { id: 'eraser', icon: <Eraser className="w-5 h-5" />, tooltip: 'Eraser' },
  ] as const;

  return (
    <div className="relative w-full h-full">
      <div className="whiteboard-toolbox">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            size="icon"
            className={`w-8 h-8 ${selectedTool === tool.id ? 'bg-primary' : ''}`}
            onClick={() => setSelectedTool(tool.id)}
            title={tool.tooltip}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
      
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseLeave={() => setIsDrawing(false)}
      />
    </div>
  );
}
