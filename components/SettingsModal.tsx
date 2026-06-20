'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function SettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'profile' | 'guide'>('keys');

  if (!showSettings) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">⚙️ Settings</h2>
            <p className="modal-subtitle">Configure API keys and profile</p>
          </div>
          <button className="btn btn-icon" onClick={() => setShowSettings(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {(['keys', 'profile', 'guide'] as const).map(tab => (
            <button
              key={tab}
              className={`modal-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'keys' && '🔑 API Keys'}
              {tab === 'profile' && '👤 Profile'}
              {tab === 'guide' && '📖 Setup Guide'}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div className="settings-group animate-fade-in">
              <div className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-icon" style={{ background: '#f55036' }}>🤖</span>
                  Groq AI (for post writing)
                </div>
                <div className="settings-field">
                  <label>Groq API Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="gsk_..."
                    value={localSettings.groqApiKey || ''}
                    onChange={(e) => set('groqApiKey', e.target.value)}
                  />
                  <span className="field-hint">
                    Get 100% FREE key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="link">console.groq.com/keys</a>
                  </span>
                </div>
              </div>

              <hr className="divider" />

              <div className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-icon" style={{ background: '#0f1923' }}>𝕏</span>
                  X (Twitter) API (for posting)
                </div>

                <div className="settings-field">
                  <label>API Key (Consumer Key) <span className="badge badge-red">Required</span></label>
                  <input type="password" className="input"
                    placeholder="Your API Key..."
                    value={localSettings.twitterApiKey}
                    onChange={(e) => set('twitterApiKey', e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>API Secret (Consumer Secret) <span className="badge badge-red">Required</span></label>
                  <input type="password" className="input"
                    placeholder="Your API Secret..."
                    value={localSettings.twitterApiSecret}
                    onChange={(e) => set('twitterApiSecret', e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Access Token <span className="badge badge-red">Required for posting</span></label>
                  <input type="password" className="input"
                    placeholder="Your Access Token..."
                    value={localSettings.twitterAccessToken}
                    onChange={(e) => set('twitterAccessToken', e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Access Token Secret <span className="badge badge-red">Required for posting</span></label>
                  <input type="password" className="input"
                    placeholder="Your Access Token Secret..."
                    value={localSettings.twitterAccessTokenSecret}
                    onChange={(e) => set('twitterAccessTokenSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-group animate-fade-in">
              <div className="settings-field">
                <label>Display Name</label>
                <input type="text" className="input"
                  placeholder="Your name..."
                  value={localSettings.username}
                  onChange={(e) => set('username', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>X Handle</label>
                <input type="text" className="input"
                  placeholder="@yourhandle"
                  value={localSettings.userHandle}
                  onChange={(e) => set('userHandle', e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Avatar Initials (2 chars)</label>
                <input type="text" className="input"
                  placeholder="CA"
                  maxLength={2}
                  value={localSettings.avatarInitials}
                  onChange={(e) => set('avatarInitials', e.target.value.toUpperCase())}
                />
              </div>
              <div className="settings-field">
                <label>Default Post Style</label>
                <select className="input"
                  value={localSettings.defaultStyle}
                  onChange={(e) => set('defaultStyle', e.target.value)}
                >
                  <option value="airdrop">🪂 Airdrop</option>
                  <option value="analysis">📊 Analysis</option>
                  <option value="breaking">🚨 Breaking News</option>
                  <option value="thread">🧵 Thread</option>
                  <option value="opinion">🔥 Opinion</option>
                  <option value="defi">⚡ DeFi</option>
                </select>
              </div>
            </div>
          )}

          {/* Setup Guide Tab */}
          {activeTab === 'guide' && (
            <div className="guide-content animate-fade-in">
              <div className="guide-step">
                <div className="guide-step-num">1</div>
                <div className="guide-step-body">
                  <h4>Get Groq API Key (100% FREE)</h4>
                  <ol>
                    <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="link">console.groq.com/keys</a></li>
                    <li>Sign up and verify your account</li>
                    <li>Click <strong>"Create API Key"</strong></li>
                    <li>Copy the key and paste it in the API Keys tab above</li>
                  </ol>
                </div>
              </div>

              <div className="guide-step">
                <div className="guide-step-num">2</div>
                <div className="guide-step-body">
                  <h4>Get X Access Token (Required for auto-posting)</h4>
                  <ol>
                    <li>Go to <a href="https://developer.x.com/en/portal/projects-and-apps" target="_blank" rel="noreferrer" className="link">developer.x.com</a></li>
                    <li>Click your app <strong>&quot;Xmasteraiagent&quot;</strong></li>
                    <li>Go to <strong>&quot;Keys and Tokens&quot;</strong> tab</li>
                    <li>Under <strong>&quot;Authentication Tokens&quot;</strong>, click <strong>&quot;Generate&quot;</strong> next to Access Token &amp; Secret</li>
                    <li>⚠️ Make sure your app has <strong>Read &amp; Write</strong> permissions first!</li>
                    <li>Copy both tokens and paste them above</li>
                  </ol>
                </div>
              </div>

              <div className="guide-step">
                <div className="guide-step-num">3</div>
                <div className="guide-step-body">
                  <h4>Enable Read &amp; Write Permissions</h4>
                  <ol>
                    <li>In your X Developer App, go to <strong>&quot;Settings&quot;</strong> tab</li>
                    <li>Find <strong>&quot;App permissions&quot;</strong></li>
                    <li>Change to <strong>&quot;Read and Write&quot;</strong></li>
                    <li>Save — then re-generate your Access Token</li>
                  </ol>
                </div>
              </div>

              <div className="guide-note">
                <span>💡</span>
                <div>
                  <strong>Cost estimate:</strong> Posting ~30 tweets/month = $0.30. 
                  Gemini is completely free for this usage level.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved!' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fade-in 0.2s ease;
        }

        .modal-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 560px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.03);
          animation: fade-in 0.25s ease;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 0;
        }

        .modal-title {
          font-size: 1.2rem;
          font-family: var(--font-heading);
        }

        .modal-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .modal-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 24px 0;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }

        .modal-tab {
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-heading);
          white-space: nowrap;
          margin-bottom: -1px;
        }

        .modal-tab.active {
          color: var(--primary-light);
          border-bottom-color: var(--primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .settings-group { display: flex; flex-direction: column; gap: 20px; }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .settings-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .settings-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-field label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .link {
          color: var(--primary-light);
          text-decoration: none;
        }

        .link:hover { text-decoration: underline; }

        .guide-content { display: flex; flex-direction: column; gap: 16px; }

        .guide-step {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .guide-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: var(--font-heading);
        }

        .guide-step-body { flex: 1; }

        .guide-step-body h4 {
          font-size: 0.9rem;
          font-family: var(--font-heading);
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .guide-step-body ol {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .guide-step-body li {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .guide-note {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          background: var(--primary-glow);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }

        select.input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
