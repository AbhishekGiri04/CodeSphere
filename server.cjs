// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Map language names to Judge0 language IDs
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  // Add more as needed
};

app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;
  const language_id = languageMap[language.toLowerCase()];
  if (!language_id) return res.status(400).json({ error: 'Unsupported language' });
  try {
    console.log('Executing code:', { language, code });
    const { data: submission } = await axios.post(
      'http://localhost:2358/submissions/?base64_encoded=false&wait=true',
      {
        source_code: code,
        language_id,
      }
    );
    console.log('Judge0 response:', submission);
    res.json({
      output: submission.stdout || submission.stderr || submission.compile_output || 'No output.',
      stdout: submission.stdout,
      stderr: submission.stderr,
      compile_output: submission.compile_output,
      status: submission.status,
      time: submission.time,
      memory: submission.memory
    });
  } catch (err) {
    console.log("Judge0 error:", err.message || err.toString());
    res.status(500).json({ error: 'Execution failed', details: err.message || err.toString() });
  }
});

app.listen(3001, () => console.log('Code executor running on port 3001'));
