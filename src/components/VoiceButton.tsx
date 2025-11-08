'use client';

/**
 * VoiceButton Component
 * 
 * Large, accessible button for voice input using Web Speech API.
 * Handles speech recognition with Korean language support.
 */

import { useState, useEffect, useRef } from 'react';
import { type Locale } from '@/lib/i18n';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  locale: Locale;
  disabled?: boolean;
}

export function VoiceButton({ onTranscript, onError, locale, disabled = false }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for SpeechRecognition support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      // Configure for Korean
      recognition.lang = locale === 'ko' ? 'ko-KR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        if (locale === 'en') {
          errorMessage = 'An error occurred during speech recognition.';
        }

        if (event.error === 'no-speech') {
          errorMessage = locale === 'ko' 
            ? '음성이 감지되지 않았습니다. 다시 시도해주세요.' 
            : 'No speech detected. Please try again.';
        } else if (event.error === 'not-allowed') {
          errorMessage = locale === 'ko'
            ? '마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.'
            : 'Microphone permission is required. Please check your browser settings.';
        }

        onError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      onError(
        locale === 'ko'
          ? '이 브라우저는 음성 인식을 지원하지 않습니다.'
          : 'This browser does not support speech recognition.'
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [locale, onTranscript, onError]);

  const handleClick = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        onError(
          locale === 'ko'
            ? '음성 인식을 시작할 수 없습니다. 다시 시도해주세요.'
            : 'Could not start speech recognition. Please try again.'
        );
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-button-container">
        <button
          type="button"
          disabled
          className="voice-button voice-button-disabled"
          aria-label={locale === 'ko' ? '음성 인식 미지원' : 'Speech recognition not supported'}
        >
          <svg className="voice-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <p className="voice-button-hint">
          {locale === 'ko' ? '음성 인식이 지원되지 않습니다' : 'Speech recognition not supported'}
        </p>
      </div>
    );
  }

  return (
    <div className="voice-button-container">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`voice-button ${isListening ? 'voice-button-listening' : ''} ${disabled ? 'voice-button-disabled' : ''}`}
        aria-label={isListening 
          ? (locale === 'ko' ? '듣는 중...' : 'Listening...')
          : (locale === 'ko' ? '말하기 시작' : 'Start speaking')
        }
        aria-pressed={isListening}
      >
        {isListening ? (
          <svg className="voice-button-icon voice-button-icon-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        ) : (
          <svg className="voice-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      <p className="voice-button-hint">
        {isListening 
          ? (locale === 'ko' ? '듣고 있어요...' : 'Listening...')
          : (locale === 'ko' ? '버튼을 눌러 말씀해주세요' : 'Press to speak')
        }
      </p>
    </div>
  );
}

