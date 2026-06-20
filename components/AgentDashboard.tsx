'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import VoiceInput from './VoiceInput';
import StyleSelector from './StyleSelector';
import ThreadPreview from './ThreadPreview';
import AIImageThumbnail from './AIImageThumbnail';
import PostHistory from './PostHistory';
import SettingsModal from './SettingsModal';
import { GeneratedPost } from '@/lib/prompts';

type Toast = { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string };

export default function AgentDashboard() {
  const {
    inputSummary, setInputSummary,
    selectedStyle, setSelectedStyle,
    isGenerating, setIsGenerating,
    isPosting, setIsPosting,
    currentPost, setCurrentPost,
    editedTweets,
    activePanel, setActivePanel,
    setShowSettings,
    addToHistory, updateHistoryItem,
    settings,
  } = useStore();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [lastHistoryId, setLastHistoryId] = useState<string | null>(null);

  // ── Toast System ──
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Generate Post ──
  const handleGenerate = async () => {
    if (!inputSummary.trim()) {
      addToast('warning', 'Please enter a topic summary first');
      return;
    }
    if (inputSummary.trim().length < 5) {
      addToast('warning', 'Topic summary is too short. Add more detail!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: inputSummary,
          style: selectedStyle,
          groqApiKey: settings.groqApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          addToast('error', '⚙️ Groq API key not set. Go to Settings → API Keys');
          setShowSettings(true);
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }

      const post = data.post as GeneratedPost;
      setCurrentPost(post);
      setActivePanel('preview');

      // Add to history
      const historyEntry = {
        summary: inputSummary,
        style: selectedStyle,
        generatedPost: post,
        postedToX: false,
      };
      addToHistory(historyEntry);

      addToast('success', `✨ Post generated! ${post.format === 'thread' ? `${post.tweets.length}-tweet thread` : 'Single tweet'} ready.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addToast('error', `Generation failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Post to X ──
  const handlePostToX = async () => {
    if (!currentPost || editedTweets.length === 0) {
      addToast('warning', 'No post to publish');
      return;
    }

    // Removed strict UI credential check to allow backend to use .env.local fallback

    setIsPosting(true);
    try {
      const response = await fetch('/api/post-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweets: editedTweets,
          isThread: currentPost.format === 'thread' && editedTweets.length > 1,
          apiKey: settings.twitterApiKey || undefined,
          apiSecret: settings.twitterApiSecret || undefined,
          accessToken: settings.twitterAccessToken || undefined,
          accessTokenSecret: settings.twitterAccessTokenSecret || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          addToast('error', '🔐 Permission denied. Enable Read+Write in your X Developer App settings.');
          return;
        }
        throw new Error(data.error || 'Posting failed');
      }

      // Update history
      const history = useStore.getState().postHistory;
      const latestId = history[0]?.id;
      if (latestId) {
        updateHistoryItem(latestId, { postedToX: true, xUrl: data.url });
      }

      addToast('success', `🚀 Posted to X! ${data.url ? `View: ${data.url}` : ''}`);

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('402') || msg.includes('Credits') || msg.includes('depleted')) {
        addToast('error', 'API Limit Reached! Please click "Copy" and paste your post directly on Twitter.com');
      } else {
        addToast('error', `Post failed: ${msg}`);
      }
    } finally {
      setIsPosting(false);
    }
  };

  // ── Copy to Clipboard ──
  const handleCopy = () => {
    if (!editedTweets.length) return;
    const text = editedTweets.join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    addToast('info', '📋 Copied to clipboard!');
  };

  const charCount = inputSummary.length;
  const hasPost = !!currentPost;

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar glass">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon animate-float">𝕏</div>
          <div>
            <div className="sidebar-logo-title">AI Agent</div>
            <div className="sidebar-logo-sub">Crypto Writer</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {[
            { id: 'input',   icon: '✍️',  label: 'Write Post'  },
            { id: 'preview', icon: '👁️',  label: 'Preview',    hasIndicator: hasPost },
            { id: 'history', icon: '📋',  label: 'History'     },
          ].map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => setActivePanel(item.id as 'input' | 'preview' | 'history')}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.hasIndicator && <span className="sidebar-indicator" />}
            </button>
          ))}
        </nav>

        {/* Style Quick Select */}
        <div className="sidebar-divider" />
        <div className="sidebar-section-title">Post Style</div>
        <StyleSelector />

        {/* Language Section Removed */}

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button className="sidebar-settings-btn" onClick={() => setShowSettings(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Settings
          </button>
          <div className="sidebar-version">v1.0 · Built by AI</div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* ── INPUT PANEL ── */}
        {activePanel === 'input' && (
          <div className="panel animate-fade-in">
            <div className="panel-header">
              <h1 className="panel-title gradient-text">Write Your Post</h1>
              <p className="panel-subtitle">Give a topic summary → AI writes a professional crypto post</p>
            </div>

            <div className="input-layout">
              {/* Left: Input */}
              <div className="input-left">
                {/* Mode Toggle */}
                <div className="input-mode-toggle">
                  <button
                    className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
                    onClick={() => setInputMode('text')}
                  >
                    ✍️ Type
                  </button>
                  <button
                    className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
                    onClick={() => setInputMode('voice')}
                  >
                    🎙️ Voice
                  </button>
                </div>

                {/* Text Input */}
                {inputMode === 'text' ? (
                  <div className="text-input-block">
                    <textarea
                      className="input main-textarea"
                      placeholder={
                        selectedStyle === 'airdrop'
                          ? "e.g. LayerZero airdrop guide — how to farm, bridge assets, use dApps, eligibility criteria, TVL is $4B..."
                          : selectedStyle === 'analysis'
                          ? "e.g. Bitcoin whale wallets moved 2,400 BTC to exchanges last night, historical pattern before correction..."
                          : selectedStyle === 'breaking'
                          ? "e.g. SEC just approved Ethereum ETF options trading, starts next week..."
                          : "Describe your topic in a few sentences..."
                      }
                      rows={6}
                      value={inputSummary}
                      onChange={(e) => setInputSummary(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
                      }}
                    />
                    <div className="input-footer">
                      <span className={`char-counter ${charCount > 800 ? 'warning' : ''}`}>
                        {charCount} chars · Ctrl+Enter to generate
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="voice-block card">
                    <VoiceInput />
                  </div>
                )}

                {/* Example prompts */}
                <div className="example-prompts">
                  <span className="example-label">Try:</span>
                  {[
                    { style: 'airdrop',  text: 'ZKsync potential airdrop guide' },
                    { style: 'analysis', text: 'ETH on-chain accumulation signal' },
                    { style: 'breaking', text: 'Binance new token listing alert' },
                  ].map((ex) => (
                    <button
                      key={ex.text}
                      className="example-chip"
                      onClick={() => {
                        setInputSummary(ex.text);
                        useStore.getState().setSelectedStyle(ex.style as 'airdrop' | 'analysis' | 'breaking');
                      }}
                    >
                      {ex.text}
                    </button>
                  ))}
                </div>

                {/* Generate Button */}
                <button
                  id="generate-btn"
                  className="btn btn-primary btn-lg generate-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputSummary.trim()}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Generate Post
                    </>
                  )}
                </button>
              </div>

              {/* Right: Skill pills */}
              <div className="input-right">
                <div className="ai-skills card">
                  <div className="ai-skills-title">🤖 AI Trained On</div>
                  <div className="ai-profiles">
                    {[
                      { handle: '@lookonchain',  skill: 'On-chain data'   },
                      { handle: '@zachxbt',      skill: 'Investigations'  },
                      { handle: '@olimpio',      skill: 'Airdrop guides'  },
                      { handle: '@ansem',        skill: 'Conviction calls' },
                      { handle: '@route2fi',     skill: 'DeFi research'   },
                      { handle: '@DegenSpartan', skill: 'Macro analysis'  },
                      { handle: '@cobie',        skill: 'Community auth.' },
                      { handle: '@WuBlockchain', skill: 'Breaking news'   },
                      { handle: '@blknoiz06',    skill: 'Solana alpha'    },
                      { handle: '@dcfgod',       skill: 'Contrarian takes' },
                    ].map((p) => (
                      <div key={p.handle} className="ai-profile-pill">
                        <span className="ai-profile-handle">{p.handle}</span>
                        <span className="ai-profile-skill">{p.skill}</span>
                      </div>
                    ))}
                    <div className="ai-profile-more">+ 90 more profiles</div>
                  </div>
                </div>

                {/* Tips */}
                <div className="tips-card card">
                  <div className="tips-title">💡 Pro Tips</div>
                  <ul className="tips-list">
                    <li>Add specific numbers (TVL, %, dates) for better posts</li>
                    <li>Mention the project name clearly</li>
                    <li>Use voice for quick braindumps</li>
                    <li>Ctrl+Enter to generate fast</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW PANEL ── */}
        {activePanel === 'preview' && (
          <div className="panel animate-fade-in">
            <div className="panel-header">
              <div>
                <h1 className="panel-title gradient-text">Post Preview</h1>
                <p className="panel-subtitle">Edit your post, check thumbnail, then publish</p>
              </div>
              {/* Action Buttons */}
              <div className="preview-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setActivePanel('input')}
                >
                  ← Back
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopy}
                  disabled={!hasPost}
                >
                  📋 Copy
                </button>
                <button
                  id="regenerate-btn"
                  className="btn btn-secondary"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <><span className="spinner" /> Re-generating...</> : '🔄 Regenerate'}
                </button>
                <button
                  id="post-to-x-btn"
                  className="btn btn-teal"
                  onClick={handlePostToX}
                  disabled={isPosting || !hasPost}
                >
                  {isPosting ? (
                    <><span className="spinner" /> Posting...</>
                  ) : (
                    <>
                      <span style={{ fontSize: '1rem' }}>𝕏</span>
                      Post to X
                    </>
                  )}
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="generating-skeleton">
                <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
              </div>
            ) : hasPost ? (
              <div className="preview-layout">
                <div className="preview-left">
                  <ThreadPreview />
                </div>
                <div className="preview-right">
                  <AIImageThumbnail />
                </div>
              </div>
            ) : (
              <div className="no-post-message">
                <div style={{ fontSize: '3rem' }}>✨</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No post generated yet</div>
                <button className="btn btn-primary" onClick={() => setActivePanel('input')}>
                  Go to Write Post
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY PANEL ── */}
        {activePanel === 'history' && (
          <div className="panel animate-fade-in">
            <div className="panel-header">
              <div>
                <h1 className="panel-title gradient-text">Post History</h1>
                <p className="panel-subtitle">All your generated posts</p>
              </div>
            </div>
            <PostHistory />
          </div>
        )}
      </main>

      {/* ── Settings Modal ── */}
      <SettingsModal />

      {/* ── Toast Notifications ── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>
              {t.type === 'success' && '✅'}
              {t.type === 'error'   && '❌'}
              {t.type === 'info'    && 'ℹ️'}
              {t.type === 'warning' && '⚠️'}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      <style>{`
        /* ── Dashboard Layout ── */
        .dashboard {
          display: flex;
          min-height: 100vh;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          border-right: 1px solid var(--border);
          padding: 20px 14px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 6px 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }

        .sidebar-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary), var(--violet));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          color: white;
          box-shadow: 0 4px 15px var(--primary-glow);
          flex-shrink: 0;
        }

        .sidebar-logo-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .sidebar-logo-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 16px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          position: relative;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .sidebar-nav-item.active {
          background: var(--primary-glow);
          color: var(--primary-light);
          border: 1px solid var(--border-accent);
        }

        .sidebar-nav-icon { font-size: 1rem; }
        .sidebar-nav-label { flex: 1; }

        .sidebar-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 6px var(--teal);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 0;
        }

        .sidebar-section-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0 4px;
          margin-bottom: 6px;
        }

        .lang-toggle {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lang-btn {
          padding: 8px 12px;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: var(--transition);
          text-align: left;
          font-family: var(--font-body);
        }

        .lang-btn.active {
          background: var(--teal-dim);
          border-color: rgba(0,212,170,0.3);
          color: var(--teal);
        }

        .sidebar-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .sidebar-settings-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 500;
          transition: var(--transition);
          font-family: var(--font-body);
          width: 100%;
          text-align: left;
        }

        .sidebar-settings-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .sidebar-version {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-align: center;
          padding: 4px;
        }

        /* ── Main Content ── */
        .main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .panel {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .panel-title {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }

        .panel-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* ── Input Layout ── */
        .input-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        .input-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-mode-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px;
          width: fit-content;
        }

        .mode-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-heading);
        }

        .mode-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .text-input-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .main-textarea {
          min-height: 160px;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .input-footer {
          display: flex;
          justify-content: flex-end;
        }

        .voice-block {
          padding: 0;
          overflow: hidden;
        }

        .example-prompts {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .example-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          flex-shrink: 0;
        }

        .example-chip {
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.77rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-body);
        }

        .example-chip:hover {
          background: var(--primary-glow);
          border-color: var(--border-accent);
          color: var(--primary-light);
        }

        .generate-btn {
          width: 100%;
          padding: 16px;
          font-size: 1rem;
          gap: 10px;
        }

        /* Input Right */
        .input-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ai-skills {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-skills-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ai-profiles {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .ai-profile-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid var(--border);
        }

        .ai-profile-handle {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--primary-light);
          font-family: var(--font-mono, monospace);
        }

        .ai-profile-skill {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .ai-profile-more {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          padding-top: 4px;
          font-style: italic;
        }

        .tips-card {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tips-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          font-family: var(--font-heading);
        }

        .tips-list {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .tips-list li {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* ── Preview Layout ── */
        .preview-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preview-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .generating-skeleton {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-post-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 24px;
          color: var(--text-muted);
        }

        /* ── Spinner ── */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin-slow 0.7s linear infinite;
          display: inline-block;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .input-layout { grid-template-columns: 1fr; }
          .input-right { display: none; }
          .preview-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
            padding: 16px 8px;
          }
          .sidebar-logo-title,
          .sidebar-logo-sub,
          .sidebar-nav-label,
          .sidebar-section-title,
          .lang-toggle,
          .sidebar-version,
          .ai-skills,
          .tips-card { display: none; }

          .sidebar-logo { justify-content: center; }
          .sidebar-nav-item { justify-content: center; padding: 10px; }
          .panel { padding: 20px 16px; }
          .panel-title { font-size: 1.4rem; }
          .panel-header { flex-direction: column; }
          .preview-actions { width: 100%; }
          .preview-actions .btn { flex: 1; }
        }
      `}</style>
    </div>
  );
}
