const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const OpenAI = require('openai');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Laad systeemprompt (je FAQ kennisbank)
const systemPrompt = fs.readFileSync(__dirname + '/system_prompt.txt', 'utf8');

// API endpoint voor de chat
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Fout bij OpenAI", details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
