const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Store room data
const rooms = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, user } = data;
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSphere!");\n    }\n}',
        language: 'java'
      });
    }
    
    const room = rooms.get(roomId);
    room.users.set(socket.id, { ...user, socketId: socket.id });
    
    // Send current room state to new user
    socket.emit('room-state', {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values())
    });
    
    // Notify others about new user
    socket.to(roomId).emit('user-joined', user);
  });

  socket.on('code-change', (data) => {
    const { roomId, code } = data;
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      socket.to(roomId).emit('code-update', { code });
    }
  });

  socket.on('cursor-position', (data) => {
    const { roomId, position } = data;
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      position
    });
  });

  socket.on('chat-message', (data) => {
    const { roomId, message, user } = data;
    io.to(roomId).emit('new-message', {
      id: Date.now(),
      message,
      user,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', user);
      }
    });
  });
});

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.post('/execute', (req, res) => {
  const { code, language } = req.body;
  const timestamp = Date.now();
  
  let fileName, command;
  
  switch (language) {
    case 'java':
      // Extract class name or use default
      let className = 'Main';
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      if (classMatch) {
        className = classMatch[1];
      } else {
        // If no public class, wrap code in Main class
        code = `public class Main {
    public static void main(String[] args) {
${code.split('\n').map(line => '        ' + line).join('\n')}
    }
}`;
      }
      fileName = `${className}.java`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `cd ${tempDir} && javac ${fileName} && java ${className}`;
      break;
      
    case 'python':
      fileName = `script_${timestamp}.py`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `cd ${tempDir} && python3 ${fileName}`;
      break;
      
    case 'cpp':
      // Add basic includes if missing
      if (!code.includes('#include')) {
        code = `#include <iostream>
using namespace std;

${code}`;
      }
      fileName = `program_${timestamp}.cpp`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `cd ${tempDir} && g++ -o program_${timestamp} ${fileName} && ./program_${timestamp}`;
      break;
      
    case 'javascript':
      fileName = `script_${timestamp}.js`;
      fs.writeFileSync(path.join(tempDir, fileName), code);
      command = `cd ${tempDir} && node ${fileName}`;
      break;
      
    default:
      return res.json({ error: 'Unsupported language' });
  }
  
  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    try {
      const files = fs.readdirSync(tempDir).filter(f => f.includes(timestamp.toString()));
      files.forEach(f => fs.unlinkSync(path.join(tempDir, f)));
    } catch (e) {}
    
    if (error) {
      return res.json({ 
        output: stderr || error.message,
        error: true 
      });
    }
    
    res.json({ 
      output: stdout || 'No output',
      error: false 
    });
  });
});

server.listen(PORT, () => {
  console.log(`Code execution server with WebSocket running on port ${PORT}`);
});