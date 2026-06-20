'use client';

import { useStore } from '@/lib/store';

const STYLE_LABELS: Record<string, string> = {
  airdrop: '🪂 Airdrop', analysis: '📊 Analysis',
  breaking: '🚨 Breaking', thread: '🧵 Thread',
  opinion: '🔥 Opinion', defi: '⚡ DeFi',
};

export default function PostHistory() {
  const { postHistory, clearHistory, setInputSummary, setSelectedStyle, setActivePanel } = useStore();

  const reusePost = (item: typeof postHistory[0]) => {
    setInputSummary(item.summary);
    setSelectedStyle(item.style);
    setActivePanel('input');
  };

  if (postHistory.length === 0) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">📋</div>
        <div className="history-empty-title">No posts yet</div>
        <div className="history-empty-sub">Your generated posts will appear here</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <span className="history-count">{postHistory.length} posts generated</span>
        <button className="btn btn-sm btn-danger" onClick={clearHistory}>
          🗑️ Clear All
        </button>
      </div>

      <div className="history-list">
        {postHistory.map((item) => (
          <div key={item.id} className="history-item card">
            {/* Header */}
            <div className="history-item-header">
              <span className="badge badge-primary">{STYLE_LABELS[item.style] || item.style}</span>
              {item.postedToX && (
                <span className="badge badge-teal">✓ Posted to X</span>
              )}
              <span className="history-time">
                {new Date(item.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Summary */}
            <div className="history-summary">{item.summary}</div>

            {/* First Tweet Preview */}
            <div className="history-preview">
              {item.generatedPost.tweets[0]?.slice(0, 120)}
              {(item.generatedPost.tweets[0]?.length || 0) > 120 ? '…' : ''}
            </div>

            {/* Footer */}
            <div className="history-item-footer">
              <div className="history-item-meta">
                <span>{item.generatedPost.format === 'thread'
                  ? `🧵 ${item.generatedPost.tweets.length} tweets`
                  : '📝 Single tweet'
                }</span>
              </div>

              <div className="history-item-actions">
                {item.xUrl && (
                  <a
                    href={item.xUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    🔗 View on X
                  </a>
                )}
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => reusePost(item)}
                >
                  ♻️ Reuse
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .history-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 60px 24px;
          color: var(--text-muted);
          text-align: center;
        }
        .history-empty-icon { font-size: 2.5rem; }
        .history-empty-title { font-weight: 600; color: var(--text-secondary); }
        .history-empty-sub { font-size: 0.82rem; }

        .history-container { display: flex; flex-direction: column; gap: 12px; }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .history-count {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
        }

        .history-item {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: var(--transition);
        }

        .history-item:hover {
          border-color: var(--border-hover);
        }

        .history-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .history-time {
          margin-left: auto;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .history-summary {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .history-preview {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .history-item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .history-item-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          gap: 10px;
        }

        .history-item-actions {
          display: flex;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
