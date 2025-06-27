const chat = document.getElementById('chat');
const input = document.getElementById('input');
const feedbackBox = document.getElementById('feedback');
let lastAnswer = null;

async function send() {
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  chat.innerHTML += `<div class="user"><strong>Jij:</strong> ${message}</div>`;
  chat.scrollTop = chat.scrollHeight;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  chat.innerHTML += `<div class="bot"><strong>Bot:</strong> ${data.reply}</div>`;
  chat.scrollTop = chat.scrollHeight;
  lastAnswer = message;
  feedbackBox.style.display = 'block';
}

function feedback(type) {
  if (lastAnswer) {
    chat.innerHTML += `<div class="bot"><em>Bedankt voor je feedback: ${type === 'tevreden' ? '😊' : '😞'}</em></div>`;
    feedbackBox.style.display = 'none';
  }
}