// Web Speech API Synthesis Wrapper for Aether Cinematic Coach Voice

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  // Attempt to select a high-quality "cinematic/robotic" sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  
  // Look for preferred voices (e.g., Google voices, natural English voices, or standard English)
  const preferredVoice = voices.find(
    (voice) =>
      voice.name.includes('Google UK English Male') ||
      voice.name.includes('Google US English') ||
      voice.name.includes('Microsoft David') ||
      voice.name.includes('Natural') ||
      (voice.lang.startsWith('en-') && voice.name.includes('Male'))
  ) || voices.find((voice) => voice.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Cinematic characteristics: slightly slower rate, slightly lower pitch
  utterance.rate = 0.95; 
  utterance.pitch = 0.85;
  utterance.volume = 0.85;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  activeUtterance = null;
}
