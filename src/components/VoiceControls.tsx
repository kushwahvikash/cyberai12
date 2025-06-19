import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { ttsService } from '../utils/textToSpeech';

interface VoiceControlsProps {
  text: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
  autoPlay?: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  text,
  onSpeechStart,
  onSpeechEnd,
  className = '',
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsService.getAvailableVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        setSelectedVoice(englishVoice.name);
      }
    };

    loadVoices();
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (autoPlay && text && !isPlaying) {
      handlePlay();
    }
  }, [text, autoPlay]);

  const handlePlay = async () => {
    if (!text.trim()) return;

    try {
      setIsPlaying(true);
      setIsPaused(false);
      onSpeechStart?.();

      await ttsService.speak(text, {
        voice: selectedVoice,
        rate,
        pitch,
        volume,
        onStart: () => {
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          onSpeechEnd?.();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
    } catch (error) {
      console.error('Failed to start speech:', error);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      ttsService.pause();
      setIsPaused(true);
    } else if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSkip = () => {
    // Skip to next sentence or paragraph
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 1) {
      const nextSentence = sentences[1] + '.';
      handleStop();
      setTimeout(() => {
        ttsService.speak(nextSentence, {
          voice: selectedVoice,
          rate,
          pitch,
          volume
        });
      }, 100);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
        disabled={!text.trim()}
      >
        {isPlaying ? (
          isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* Stop Button */}
      {isPlaying && (
        <button
          onClick={handleStop}
          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Stop"
        >
          <VolumeX className="h-4 w-4" />
        </button>
      )}

      {/* Skip Button */}
      {isPlaying && (
        <button
          onClick={handleSkip}
          className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          title="Skip"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      )}

      {/* Voice Selection */}
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
        title="Select Voice"
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      {/* Speed Control */}
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">Speed:</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-12 h-1"
          title="Speech Rate"
        />
        <span className="text-xs text-gray-500 w-8">{rate}x</span>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">Vol:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-12 h-1"
          title="Volume"
        />
      </div>

      {/* Status Indicator */}
      {isPlaying && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 dark:text-green-400">
            {isPaused ? 'Paused' : 'Speaking'}
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;