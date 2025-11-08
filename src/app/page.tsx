'use client';

/**
 * HanMate - Main Page
 * 
 * Single-page voice-first Korean AI companion for elderly people.
 * Core flow: Press mic → Speak → Get warm Korean reply → Hear reply aloud.
 */

import { useState, useEffect, useRef } from 'react';
import { NearbyPeople } from '@/components/NearbyPeople';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for speech recognition support on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (event.results && event.results.length > 0 && event.results[0].length > 0) {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          handleUserMessage(transcript);
        }
      }
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '음성 인식 중 오류가 발생했습니다.';
      
      if (event.error === 'no-speech') {
        errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
      } else if (event.error === 'not-allowed') {
        errorMessage = '마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.';
      } else if (event.error === 'network') {
        errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send to API
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('응답을 받는 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('잘못된 응답을 받았습니다.');
      }

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Speak the AI reply
      speakText(data.reply);
    } catch (err: any) {
      const errorMsg = err?.message || '응답을 받는 중 문제가 발생했습니다.';
      setError(errorMsg);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: '죄송합니다. 잠시 후 다시 시도해주세요.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9; // Slightly slower for elders
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find Korean voice
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(voice => 
        voice.lang.startsWith('ko') || voice.name.includes('Korean')
      );
      
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }

      // Load voices if not available yet
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const koreanVoice = updatedVoices.find(voice => 
            voice.lang.startsWith('ko') || voice.name.includes('Korean')
          );
          if (koreanVoice) {
            utterance.voice = koreanVoice;
          }
          window.speechSynthesis.speak(utterance);
        };
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  };

  const handleMicClick = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        if (error?.message?.includes('already started')) {
          return;
        }
        setError('음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Browser Support Alert */}
      {isSupported === false && (
        <div className="w-full max-w-lg mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm text-center">
            이 브라우저에서는 음성 인식이 지원되지 않습니다. 다른 기기에서 접속해 주세요.
          </p>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center" aria-label="HanMate - 따뜻한 AI 동반자">
            말씀하세요. 제가 들어드릴게요.
          </h1>

          {/* Conversation Area */}
          <div 
            className="h-56 overflow-y-auto mb-6 space-y-3 pr-2"
            aria-label="대화 영역"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  말씀을 시작해주세요.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                  role={message.role === 'user' ? 'user message' : 'assistant message'}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100">
                  <p className="text-base text-gray-600 italic">
                    생각 중이에요…
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mic Button */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isSupported === false}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isListening
                  ? 'bg-blue-500 text-white animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
              } ${isSupported === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={isListening ? '듣는 중입니다' : '말하기 시작'}
              aria-pressed={isListening}
            >
              {isListening ? (
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>

            {/* Loading Text */}
            {isLoading && (
              <p className="text-sm text-gray-500" aria-live="polite">
                생각 중이에요…
              </p>
            )}

            {/* Error Message */}
            {error && isSupported !== false && (
              <p className="text-sm text-red-600 text-center max-w-xs" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Nearby People Section */}
        <div className="mt-8">
          <NearbyPeople />
        </div>
      </div>
    </div>
  );
}
