'use client';

import { useStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { ThumbnailTemplate } from '@/lib/prompts';

export default function ThreadPreview() {
  const {
    editedTweets, currentPost, selectedTweetIndex,
    setSelectedTweetIndex, updateEditedTweet, settings,
  } = useStore();

  if (!currentPost) return null;

  const tweets = editedTweets.length > 0 ? editedTweets : currentPost.tweets;
  const isThread = currentPost.format === 'thread' && tweets.length > 1;

  return (
    <div className="preview-container animate-fade-in">
      {/* Thread nav tabs */}
      {isThread && (
        <div className="thread-tabs">
          {tweets.map((_, i) => (
            <button
              key={i}
              className={`thread-tab ${selectedTweetIndex === i ? 'active' : ''}`}
              onClick={() => setSelectedTweetIndex(i)}
            >
              {i === 0 ? '🪝 Hook' : i === tweets.length - 1 ? '🎯 CTA' : `${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* X-Style Tweet Card */}
      <div className="tweet-card" style={{ borderLeft: `3px solid var(--primary)` }}>
        {/* Header */}
        <div className="tweet-header">
          <div className="tweet-avatar" style={{ background: `linear-gradient(135deg, var(--violet), var(--primary))` }}>
            {settings.avatarInitials || 'CA'}
          </div>
          <div className="tweet-user-info">
            <div className="tweet-name">{settings.username || 'Crypto Alpha'}</div>
            <div className="tweet-handle">{settings.userHandle || '@cryptoalpha'}</div>
          </div>
          <div className="tweet-x-logo">𝕏</div>
        </div>

        {/* Editable Tweet Text */}
        <div className="tweet-body">
          <textarea
            className="tweet-text-editor"
            value={tweets[selectedTweetIndex] || ''}
            onChange={(e) => updateEditedTweet(selectedTweetIndex, e.target.value)}
            rows={8}
            maxLength={4000}
          />
          <div className={`char-counter ${(tweets[selectedTweetIndex]?.length || 0) > 3900
            ? 'danger'
            : (tweets[selectedTweetIndex]?.length || 0) > 3500
              ? 'warning' : ''}`}
          >
            {tweets[selectedTweetIndex]?.length || 0} / 4000 (X Premium)
          </div>
        </div>

        {/* Thread indicator */}
        {isThread && (
          <div className="tweet-thread-indicator">
            <span className="thread-line" />
            <span className="thread-label">
              {selectedTweetIndex + 1}/{tweets.length} in thread
            </span>
          </div>
        )}

        {/* Tweet Footer */}
        <div className="tweet-footer">
          <div className="tweet-actions">
            <span className="tweet-action">💬 Reply</span>
            <span className="tweet-action">🔁 Repost</span>
            <span className="tweet-action">❤️ Like</span>
            <span className="tweet-action">📊 Views</span>
          </div>
          <div className="tweet-time">Just now · via AI Agent</div>
        </div>
      </div>

      {/* Template badge removed */}
      <div className="preview-meta">

        {/* Hashtags */}
        {currentPost.hashtags && currentPost.hashtags.length > 0 && (
          <div className="preview-hashtags">
            {currentPost.hashtags.map(tag => (
              <span key={tag} className="tag tag-active">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Engagement hook */}
      {currentPost.engagementHook && (
        <div className="preview-hook">
          <span className="hook-label">🎣 Hook used</span>
          <span className="hook-text">&ldquo;{currentPost.engagementHook}&rdquo;</span>
        </div>
      )}

      {/* Suggested time */}
      {currentPost.suggestedTime && (
        <div className="preview-timing">
          <span>⏰</span>
          <span>{currentPost.suggestedTime}</span>
        </div>
      )}

      <style>{`
        .preview-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .thread-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .thread-tab {
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-heading);
        }

        .thread-tab.active {
          background: var(--primary-glow);
          border-color: var(--border-accent);
          color: var(--primary-light);
        }

        .tweet-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: var(--transition);
        }

        .tweet-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tweet-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: var(--font-heading);
          color: white;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .tweet-user-info { flex: 1; }

        .tweet-name {
          font-weight: 700;
          font-family: var(--font-heading);
          font-size: 0.92rem;
          color: var(--text-primary);
        }

        .tweet-handle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .tweet-x-logo {
          font-size: 1.2rem;
          color: var(--text-muted);
        }

        .tweet-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tweet-text-editor {
          width: 100%;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          padding: 12px 14px;
          resize: none;
          outline: none;
          transition: var(--transition);
          min-height: 100px;
        }

        .tweet-text-editor:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .tweet-thread-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 4px;
        }

        .thread-line {
          width: 2px;
          height: 20px;
          background: var(--border);
          border-radius: 99px;
        }

        .thread-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .tweet-footer {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tweet-actions {
          display: flex;
          gap: 16px;
        }

        .tweet-action {
          font-size: 0.78rem;
          color: var(--text-muted);
          cursor: default;
        }

        .tweet-time {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .preview-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preview-template-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1px solid;
          font-family: var(--font-heading);
        }

        .preview-hashtags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preview-hook {
          display: flex;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 10px 14px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          align-items: flex-start;
        }

        .hook-label {
          color: var(--primary-light);
          font-weight: 600;
          flex-shrink: 0;
        }

        .hook-text {
          font-style: italic;
          line-height: 1.5;
        }

        .preview-timing {
          display: flex;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--amber);
          align-items: center;
          padding: 8px 12px;
          background: var(--amber-dim);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
