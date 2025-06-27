// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

// Laad FAQ-data uit JSON-bestand
const faqData = JSON.parse(fs.readFileSync('./server/faq_data_extended_clean.json', 'utf8'));

// Simpele zoekfunctie op basis van overlap
function findRelevantFaqs(userInput, topN = 3) {
  const keywords = userInput.toLowerCase().split(/\s+/);
  const scored = faqData.map(item => {
    const score = keywords.filter(k => item.vraag.toLowerCase().includes(k) || item.antwoord.toLowerCase().includes(k)).length;
    return { ...item, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ reply: "Geen bericht ontvangen." });

  const relevantFaqs = findRelevantFaqs(userMessage);
  const faqContext = relevantFaqs.map(f => `Vraag: ${f.vraag}\nAntwoord: ${f.antwoord}`).join("\n\n");

  const messages = [
    {
      role: "system",
      content: `Je bent een behulpzame klantenservice medewerker van Stalling31. Beantwoord de vraag van de gebruiker op basis van de volgende kennisbank, als je het niet weet verwijs dan naar klantenservice@stalling31.nl.\n\n${faqContext}`
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ reply: "Er ging iets mis met het AI-antwoord." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
