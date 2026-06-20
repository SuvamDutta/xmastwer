'use client';

import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function AIImageThumbnail() {
  const { currentPost } = useStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentPost?.imagePrompt) {
      setIsLoading(true);
      // Pollinations.ai generates free images on the fly via URL
      // Seed is randomized so it generates a fresh image each time
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(currentPost.imagePrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&seed=${seed}`;
      
      setImageUrl(url);
    }
  }, [currentPost?.imagePrompt]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `x-thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  if (!currentPost) return null;

  return (
    <div className="ai-thumbnail-container">
      <div className="thumbnail-header">
        <h3 className="thumbnail-title">
          <span className="ai-sparkles">✨</span> AI Generated Graphic
        </h3>
        <p className="thumbnail-subtitle">Auto-generated for your post topic</p>
      </div>

      <div className="thumbnail-card">
        {isLoading && (
          <div className="thumbnail-loader">
            <div className="spinner-large" />
            <span>Generating Image... (Usually takes 5s)</span>
          </div>
        )}
        
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="AI Generated Thumbnail" 
            className={`thumbnail-image ${isLoading ? 'hidden' : ''}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>

      <div className="thumbnail-prompt-box">
        <div className="prompt-label">AI Image Prompt:</div>
        <div className="prompt-text">{currentPost.imagePrompt}</div>
      </div>

      <div className="thumbnail-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleDownload}
          disabled={isLoading || !imageUrl}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Download Image
        </button>
      </div>

      <style>{`
        .ai-thumbnail-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .thumbnail-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .thumbnail-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ai-sparkles {
          color: var(--violet);
        }

        .thumbnail-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .thumbnail-card {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .thumbnail-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
          font-size: 0.9rem;
          position: absolute;
        }

        .spinner-large {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .thumbnail-image.hidden {
          opacity: 0;
        }

        .thumbnail-prompt-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
        }

        .prompt-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .prompt-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          font-style: italic;
        }

        .thumbnail-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}
