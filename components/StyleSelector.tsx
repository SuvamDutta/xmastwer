'use client';

import { PostStyle } from '@/lib/prompts';
import { useStore } from '@/lib/store';

const STYLES: { id: PostStyle; label: string; emoji: string; desc: string; badge: string }[] = [
  { id: 'airdrop',  label: 'Airdrop',   emoji: '🪂', desc: 'Step-by-step farming guides',   badge: 'badge-blue' },
  { id: 'analysis', label: 'Analysis',  emoji: '📊', desc: 'On-chain data & market reads',   badge: 'badge-green' },
  { id: 'breaking', label: 'Breaking',  emoji: '🚨', desc: 'Fast news & urgent updates',     badge: 'badge-red' },
  { id: 'thread',   label: 'Thread',    emoji: '🧵', desc: 'Multi-tweet deep dives',         badge: 'badge-primary' },
  { id: 'opinion',  label: 'Opinion',   emoji: '🔥', desc: 'Hot takes & contrarian views',   badge: 'badge-amber' },
  { id: 'defi',     label: 'DeFi',      emoji: '⚡', desc: 'Protocol research & yield',      badge: 'badge-teal' },
];

export default function StyleSelector() {
  const { selectedStyle, setSelectedStyle } = useStore();

  return (
    <div className="style-selector">
      <div className="style-grid">
        {STYLES.map((style) => (
          <button
            key={style.id}
            className={`style-item ${selectedStyle === style.id ? 'active' : ''}`}
            onClick={() => setSelectedStyle(style.id)}
            title={style.desc}
          >
            <span className="style-emoji">{style.emoji}</span>
            <div className="style-info">
              <span className="style-name">{style.label}</span>
              <span className="style-desc">{style.desc}</span>
            </div>
            {selectedStyle === style.id && (
              <span className="style-check">✓</span>
            )}
          </button>
        ))}
      </div>

      <style>{`
        .style-selector { display: flex; flex-direction: column; gap: 8px; }

        .style-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .style-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .style-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          cursor: pointer;
          text-align: left;
          transition: var(--transition);
          position: relative;
          font-family: var(--font-body);
          width: 100%;
        }

        .style-item:hover {
          border-color: var(--border-hover);
          background: var(--bg-hover);
        }

        .style-item.active {
          border-color: var(--primary);
          background: var(--primary-glow);
        }

        .style-emoji {
          font-size: 1rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .style-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .style-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-heading);
        }

        .style-desc {
          font-size: 0.65rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: none;
        }

        .style-check {
          color: var(--primary-light);
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
