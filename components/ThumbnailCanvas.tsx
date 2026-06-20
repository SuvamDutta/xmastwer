'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { drawThumbnail, TEMPLATES } from '@/lib/templates';
import { ThumbnailTemplate } from '@/lib/prompts';

const TEMPLATE_OPTIONS: { id: ThumbnailTemplate; label: string; color: string }[] = [
  { id: 'alpha',    label: '🔥 Alpha',    color: '#00d4aa' },
  { id: 'airdrop',  label: '🪂 Airdrop',  color: '#3b82f6' },
  { id: 'analysis', label: '📊 Analysis', color: '#22c55e' },
  { id: 'breaking', label: '🚨 Breaking', color: '#ef4444' },
  { id: 'defi',     label: '⚡ DeFi',      color: '#f59e0b' },
  { id: 'thread',   label: '🧵 Thread',    color: '#8b5cf6' },
  { id: 'zax',      label: '🔥 Neon (Zax)', color: '#f97316' },
  { id: 'glass',    label: '✨ Glass',     color: '#38bdf8' },
  { id: 'billions', label: '🎯 Billions',  color: '#4ade80' },
  { id: 'premium_banner', label: '🏆 Premium Banner',  color: '#fbbf24' },
];

export default function ThumbnailCanvas() {
  const { currentPost, editedTweets, settings } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate>('alpha');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);



  // Render canvas whenever content or template changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPost) return;

    const tweet = editedTweets[0] || currentPost.tweets[0] || '';
    const handle = settings.userHandle || '@cryptoalpha';

    drawThumbnail(canvas, selectedTemplate, tweet, handle);
  }, [currentPost, editedTweets, selectedTemplate, settings.userHandle]);

  const downloadThumbnail = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed')), 'image/png', 1.0);
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x-post-thumbnail-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback to download if clipboard not supported
      downloadThumbnail();
    }
  };

  if (!currentPost) {
    return (
      <div className="thumbnail-empty">
        <div className="thumbnail-empty-icon">🖼️</div>
        <div className="thumbnail-empty-text">Generate a post to see thumbnail preview</div>
      </div>
    );
  }

  return (
    <div className="thumbnail-container animate-fade-in">
      {/* Template Picker */}
      <div className="template-picker">
        <div className="template-picker-label">Thumbnail Style</div>
        <div className="template-picker-grid">
          {TEMPLATE_OPTIONS.map((t) => (
            <button
              key={t.id}
              className={`template-option ${selectedTemplate === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(t.id)}
              style={selectedTemplate === t.id ? { borderColor: t.color, color: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={1200}
          height={628}
          className="thumbnail-canvas"
        />
        <div className="canvas-size-label">1200 × 628 · X optimal size</div>
      </div>

      {/* Actions */}
      <div className="thumbnail-actions">
        <button className="btn btn-secondary" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : '📋 Copy Image'}
        </button>
        <button
          className="btn btn-teal"
          onClick={downloadThumbnail}
          disabled={isDownloading}
        >
          {isDownloading ? '⏳ Saving...' : '⬇️ Download PNG'}
        </button>
      </div>

      <style>{`
        .thumbnail-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px 24px;
          color: var(--text-muted);
        }

        .thumbnail-empty-icon { font-size: 3rem; }
        .thumbnail-empty-text { font-size: 0.875rem; }

        .thumbnail-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .template-picker { display: flex; flex-direction: column; gap: 8px; }

        .template-picker-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .template-picker-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .template-option {
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 0.77rem;
          font-weight: 600;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-heading);
        }

        .template-option:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .template-option.active {
          background: var(--bg-hover);
        }

        .canvas-wrapper {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .thumbnail-canvas {
          width: 100%;
          height: auto;
          display: block;
        }

        .canvas-size-label {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.4);
          font-family: var(--font-mono, monospace);
          background: rgba(0,0,0,0.5);
          padding: 2px 8px;
          border-radius: 99px;
        }

        .thumbnail-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
