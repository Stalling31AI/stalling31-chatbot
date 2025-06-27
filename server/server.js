const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const systemPrompt = fs.readFileSync('./server/system_prompt.txt', 'utf8');

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages
    });
    res.json({ reply: completion.data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "OpenAI API error", details: e.message });
  }
});

app.listen(3000, () => console.log("Server draait op http://localhost:3000"));
