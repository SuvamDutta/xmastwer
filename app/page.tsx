'use client';

import dynamic from 'next/dynamic';
import ParticleBackground from '@/components/ParticleBackground';

// Dynamic import to avoid SSR issues with browser APIs
const AgentDashboard = dynamic(() => import('@/components/AgentDashboard'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        animation: 'float 3s ease-in-out infinite',
      }}>𝕏</div>
      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading AI Agent…</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="app-container">
      <ParticleBackground />
      <AgentDashboard />
    </div>
  );
}
