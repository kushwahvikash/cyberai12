export class TextToSpeechService {
  private static instance: TextToSpeechService;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith(language));
  }

  speak(text: string, options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    language?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice || voice.lang === options.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else if (options.language) {
        const languageVoices = this.getVoicesByLanguage(options.language);
        if (languageVoices.length > 0) {
          utterance.voice = languageVoices[0];
        }
      }

      // Set speech parameters
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Set event handlers
      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (error) => {
        this.currentUtterance = null;
        options.onError?.(error);
        reject(error);
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }

  // Advanced features
  async speakWithHighlight(text: string, options: {
    highlightCallback?: (word: string, index: number) => void;
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    const words = text.split(' ');
    let currentIndex = 0;

    const speakWord = async (word: string): Promise<void> => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(word);
        
        if (options.voice) {
          const selectedVoice = this.voices.find(voice => voice.name === options.voice);
          if (selectedVoice) utterance.voice = selectedVoice;
        }

        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        utterance.onstart = () => {
          options.highlightCallback?.(word, currentIndex);
        };

        utterance.onend = () => {
          currentIndex++;
          resolve();
        };

        this.synthesis.speak(utterance);
      });
    };

    for (const word of words) {
      await speakWord(word);
      if (!this.synthesis.speaking) break; // Stop if cancelled
    }
  }

  // SSML support for advanced speech control
  speakSSML(ssml: string, options: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  } = {}): Promise<void> {
    // Convert SSML to plain text for basic browsers
    const plainText = ssml.replace(/<[^>]*>/g, '');
    return this.speak(plainText, options);
  }

  // Multi-language support
  async detectLanguageAndSpeak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): Promise<void> {
    // Simple language detection based on character patterns
    const language = this.detectLanguage(text);
    const voices = this.getVoicesByLanguage(language);
    
    if (voices.length > 0) {
      return this.speak(text, {
        ...options,
        voice: voices[0].name
      });
    }
    
    return this.speak(text, options);
  }

  private detectLanguage(text: string): string {
    // Simple language detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'; // Japanese
    if (/[\u0600-\u06ff]/.test(text)) return 'ar'; // Arabic
    if (/[\u0400-\u04ff]/.test(text)) return 'ru'; // Russian
    return 'en'; // Default to English
  }
}

export const ttsService = TextToSpeechService.getInstance();