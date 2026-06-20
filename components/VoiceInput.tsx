'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';



export default function VoiceInput() {
  const {
    isRecording, setIsRecording,
    voiceTranscript, setVoiceTranscript,
    setInputSummary, inputSummary,
  } = useStore();

  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRec);
  }, []);

  const stopAudioVisualization = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, avg * 2.5));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Visualization optional — don't block recording
    }
  }, []);

  const startRecording = useCallback(async () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    setError(null);
    setVoiceTranscript('');

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Best for English + Hinglish

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const combined = (voiceTranscript + finalTranscript + interimTranscript).trim();
      setVoiceTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event.error}. Try again or type manually.`);
      setIsRecording(false);
      stopAudioVisualization();
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopAudioVisualization();
      // Copy transcript to main input
      const finalText = useStore.getState().voiceTranscript;
      if (finalText) {
        setInputSummary(finalText);
      }
    };

    recognition.start();
    await startAudioVisualization();
  }, [voiceTranscript, setVoiceTranscript, setIsRecording, setInputSummary, startAudioVisualization, stopAudioVisualization]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    stopAudioVisualization();
    const finalText = useStore.getState().voiceTranscript;
    if (finalText) setInputSummary(finalText);
  }, [setIsRecording, setInputSummary, stopAudioVisualization]);

  const useTranscript = useCallback(() => {
    if (voiceTranscript) {
      setInputSummary(voiceTranscript);
      setVoiceTranscript('');
    }
  }, [voiceTranscript, setInputSummary, setVoiceTranscript]);

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        <span>🎙️</span>
        <p>Voice not supported in this browser. Use Chrome for best experience.</p>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      {/* Mic Button */}
      <div className="voice-mic-wrapper">
        {isRecording && (
          <>
            <div className="voice-ring voice-ring-1" style={{ transform: `scale(${1 + audioLevel / 200})` }} />
            <div className="voice-ring voice-ring-2" style={{ transform: `scale(${1 + audioLevel / 120})` }} />
          </>
        )}
        <button
          className={`voice-mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Live Status */}
      <div className="voice-status">
        {isRecording ? (
          <div className="voice-live">
            <span className="voice-dot" />
            <span>Listening… speak your topic</span>
          </div>
        ) : (
          <span className="voice-hint">Tap mic to speak your topic</span>
        )}
      </div>

      {/* Live Transcript */}
      {voiceTranscript && (
        <div className="voice-transcript animate-fade-in">
          <p className="voice-transcript-text">&ldquo;{voiceTranscript}&rdquo;</p>
          <button className="btn btn-sm btn-teal" onClick={useTranscript}>
            ✓ Use This
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="voice-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <style>{`
        .voice-input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 20px;
        }

        .voice-mic-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
        }

        .voice-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(239, 68, 68, 0.4);
          transition: transform 0.1s ease;
          pointer-events: none;
        }

        .voice-ring-1 { width: 80px; height: 80px; }
        .voice-ring-2 { width: 80px; height: 80px; border-color: rgba(239, 68, 68, 0.2); }

        .voice-mic-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--violet));
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          position: relative;
          z-index: 1;
          box-shadow: 0 4px 20px var(--primary-glow);
        }

        .voice-mic-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 30px var(--primary-glow);
        }

        .voice-mic-btn.recording {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          animation: pulse-glow 1.5s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        }

        .voice-status {
          font-size: 0.82rem;
          color: var(--text-muted);
          text-align: center;
        }

        .voice-live {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--red);
          font-weight: 500;
        }

        .voice-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--red);
          animation: pulse-glow 1s infinite;
          display: inline-block;
        }

        .voice-hint { color: var(--text-muted); }

        .voice-transcript {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .voice-transcript-text {
          color: var(--text-secondary);
          font-style: italic;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .voice-error {
          color: var(--red);
          font-size: 0.8rem;
          background: var(--red-dim);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          width: 100%;
        }

        .voice-unsupported {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.82rem;
          padding: 12px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
