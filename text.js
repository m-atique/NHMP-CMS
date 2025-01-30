// Create a SpeechSynthesisUtterance instance
const text = 'Hello, World!';
const utterance = new SpeechSynthesisUtterance(text);

// Speak the text
window.speechSynthesis.speak(utterance);
