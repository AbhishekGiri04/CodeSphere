import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Eraser, Square, Circle, Minus, Trash2, Download } from "lucide-react";
import { useCollaborationContext } from "@/contexts/CollaborationContext";

type DrawingTool = "pen" | "eraser" | "rectangle" | "circle" | "line";

type DrawingData = {
  tool: DrawingTool;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  color: string;
  width: number;
  type: 'start' | 'draw' | 'end';
};

export default function RealWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { socket, roomId } = useCollaborationContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set canvas background based on theme
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#1E1E1E' : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set default styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, []);

  // Listen for whiteboard updates from other users
  useEffect(() => {
    if (socket) {
      socket.on('whiteboard-update', (data: DrawingData) => {
        drawFromData(data);
      });

      socket.on('whiteboard-clear', () => {
        clearCanvas();
      });

      return () => {
        socket.off('whiteboard-update');
        socket.off('whiteboard-clear');
      };
    }
  }, [socket]);

  const drawFromData = (data: DrawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;

    if (data.tool === "pen") {
      if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.startPos.x, data.startPos.y);
      } else if (data.type === 'draw') {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineTo(data.endPos.x, data.endPos.y);
        ctx.stroke();
      }
    } else if (data.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(data.endPos.x, data.endPos.y, data.width * 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (data.type === 'end') {
      ctx.globalCompositeOperation = "source-over";
      if (data.tool === "rectangle") {
        ctx.strokeRect(data.startPos.x, data.startPos.y, data.endPos.x - data.startPos.x, data.endPos.y - data.startPos.y);
      } else if (data.tool === "circle") {
        const radius = Math.sqrt(Math.pow(data.endPos.x - data.startPos.x, 2) + Math.pow(data.endPos.y - data.startPos.y, 2));
        ctx.beginPath();
        ctx.arc(data.startPos.x, data.startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (data.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(data.startPos.x, data.startPos.y);
        ctx.lineTo(data.endPos.x, data.endPos.y);
        ctx.stroke();
      }
    }
  };

  const emitDrawingData = (data: DrawingData) => {
    if (socket && roomId) {
      socket.emit('whiteboard-draw', { roomId, drawingData: data });
    }
  };
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#1E1E1E' : '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    if (currentTool === "pen") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      emitDrawingData({
        tool: currentTool,
        startPos: { x, y },
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'start'
      });
    } else if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, strokeWidth * 2, 0, 2 * Math.PI);
      ctx.fill();
      emitDrawingData({
        tool: currentTool,
        startPos: { x, y },
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'draw'
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineTo(x, y);
      ctx.stroke();
      emitDrawingData({
        tool: currentTool,
        startPos: startPos,
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'draw'
      });
    } else if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, strokeWidth * 2, 0, 2 * Math.PI);
      ctx.fill();
      emitDrawingData({
        tool: currentTool,
        startPos: startPos,
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'draw'
      });
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";

    if (currentTool === "rectangle") {
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      emitDrawingData({
        tool: currentTool,
        startPos: startPos,
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'end'
      });
    } else if (currentTool === "circle") {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      emitDrawingData({
        tool: currentTool,
        startPos: startPos,
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'end'
      });
    } else if (currentTool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      emitDrawingData({
        tool: currentTool,
        startPos: startPos,
        endPos: { x, y },
        color: strokeColor,
        width: strokeWidth,
        type: 'end'
      });
    }

    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Emit clear event to other users
    if (socket && roomId) {
      socket.emit('whiteboard-clear', { roomId });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const tools = [
    { id: "pen", icon: Pencil, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
  ];

  const colors = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 border-b border-border">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTool(tool.id as DrawingTool)}
              className="h-8 w-8 p-0"
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 ${
                strokeColor === color ? "border-foreground" : "border-border"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-foreground w-6">{strokeWidth}</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Actions */}
        <Button variant="ghost" size="sm" onClick={clearCanvas}>
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadCanvas}>
          <Download className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}