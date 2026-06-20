import { ThumbnailTemplate } from './prompts';

export interface TemplateConfig {
  id: ThumbnailTemplate;
  name: string;
  background: string[];       // gradient stops
  accentColor: string;
  textColor: string;
  subtextColor: string;
  badgeColor: string;
  badgeText: string;
  pattern: 'grid' | 'dots' | 'circuit' | 'waves' | 'none';
}

export const TEMPLATES: Record<ThumbnailTemplate, TemplateConfig> = {
  alpha: {
    id: 'alpha',
    name: 'Alpha Alert',
    background: ['#0a0b0f', '#0d1117', '#0a1628'],
    accentColor: '#00d4aa',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    badgeColor: '#00d4aa',
    badgeText: '🔥 ALPHA',
    pattern: 'grid',
  },
  thread: {
    id: 'thread',
    name: 'Thread Starter',
    background: ['#0f0c29', '#302b63', '#24243e'],
    accentColor: '#8b5cf6',
    textColor: '#ffffff',
    subtextColor: '#c4b5fd',
    badgeColor: '#8b5cf6',
    badgeText: '🧵 THREAD',
    pattern: 'dots',
  },
  airdrop: {
    id: 'airdrop',
    name: 'Airdrop Guide',
    background: ['#0a1628', '#0d2137', '#051020'],
    accentColor: '#3b82f6',
    textColor: '#ffffff',
    subtextColor: '#93c5fd',
    badgeColor: '#2563eb',
    badgeText: '🪂 AIRDROP',
    pattern: 'circuit',
  },
  analysis: {
    id: 'analysis',
    name: 'Market Analysis',
    background: ['#0a0a0a', '#111111', '#0d1a0d'],
    accentColor: '#22c55e',
    textColor: '#ffffff',
    subtextColor: '#86efac',
    badgeColor: '#16a34a',
    badgeText: '📊 ANALYSIS',
    pattern: 'grid',
  },
  breaking: {
    id: 'breaking',
    name: 'Breaking News',
    background: ['#1a0505', '#200808', '#0f0000'],
    accentColor: '#ef4444',
    textColor: '#ffffff',
    subtextColor: '#fca5a5',
    badgeColor: '#dc2626',
    badgeText: '🚨 BREAKING',
    pattern: 'none',
  },
  defi: {
    id: 'defi',
    name: 'DeFi Research',
    background: ['#0d0f1a', '#111528', '#080a14'],
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    subtextColor: '#fcd34d',
    badgeColor: '#d97706',
    badgeText: '⚡ DEFI',
    pattern: 'waves',
  },
  zax: {
    id: 'zax',
    name: 'Neon Alpha',
    background: ['#000000', '#0a0a0a', '#1a0525'],
    accentColor: '#f97316',
    textColor: '#ffffff',
    subtextColor: '#fdba74',
    badgeColor: '#ea580c',
    badgeText: '🔥 NEON',
    pattern: 'waves',
  },
  glass: {
    id: 'glass',
    name: 'Shattered Glass',
    background: ['#001122', '#003366', '#000000'],
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    subtextColor: '#7dd3fc',
    badgeColor: '#0284c7',
    badgeText: '✨ FUNDED',
    pattern: 'grid',
  },
  billions: {
    id: 'billions',
    name: 'Playful Flat',
    background: ['#1d4ed8', '#2563eb', '#3b82f6'],
    accentColor: '#4ade80',
    textColor: '#ffffff',
    subtextColor: '#e2e8f0',
    badgeColor: '#22c55e',
    badgeText: '🎯 BILLIONS',
    pattern: 'dots',
  },
  premium_banner: {
    id: 'premium_banner',
    name: 'Premium Banner',
    background: ['#0f0f11', '#1a1a1c', '#08080a'],
    accentColor: '#fbbf24',
    textColor: '#ffffff',
    subtextColor: '#fcd34d',
    badgeColor: '#fbbf24',
    badgeText: 'PREMIUM',
    pattern: 'dots',
  },
};

export function drawPremiumBanner(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  tweetText: string
): void {
  // Extract Title from first line
  const lines = tweetText.split('\n').filter(l => l.trim().length > 0);
  let titleStr = lines[0] || 'CRYPTO PROTOCOL';
  // remove emojis
  titleStr = titleStr.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  titleStr = titleStr.toUpperCase();

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#111');
  bgGrad.addColorStop(1, '#000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Gold dust pattern
  ctx.fillStyle = '#fbbf24';
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Gold lines top and bottom
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(W, 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke();

  // Left glowing circle for logo
  const cx = 250;
  const cy = H / 2;
  const cr = 180;
  
  const glowGrad = ctx.createRadialGradient(cx, cy, cr - 20, cx, cy, cr + 40);
  glowGrad.addColorStop(0, '#fbbf24');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(cx - cr - 50, cy - cr - 50, cr * 2 + 100, cr * 2 + 100);

  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Placeholder Logo inside circle
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px "Arial"';
  ctx.fillText('ADD LOGO', cx, cy + 8);

  // Right Side Text
  const textX = 500;
  
  // Row 1: Title
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'left';
  ctx.font = 'italic bold 80px "Arial Black", "Impact", sans-serif';
  // Draw stroke for shadow effect
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000';
  ctx.strokeText(titleStr.substring(0, 30), textX, 220);
  ctx.fillText(titleStr.substring(0, 30), textX, 220);

  // Row 2: Badge and Text
  const badgeW = 300;
  const badgeH = 80;
  const badgeY = 270;
  
  ctx.fillStyle = '#fbbf24';
  roundRect(ctx, textX, badgeY, badgeW, badgeH, 10);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.font = 'italic bold 50px "Arial Black", "Impact", sans-serif';
  ctx.fillText('ROADMAP', textX + 20, badgeY + 58);

  ctx.fillStyle = '#fff';
  ctx.fillText('COMPLETE', textX + badgeW + 20, badgeY + 58);

  // Row 3: Subtext
  ctx.fillStyle = '#fff';
  ctx.font = 'italic bold 36px "Arial Black", "Impact", sans-serif';
  ctx.fillText('& OFFICIAL AIRDROP UPDATE', textX, 450);
}

export function drawThumbnail(
  canvas: HTMLCanvasElement,
  template: ThumbnailTemplate,
  tweetText: string,
  handle: string = '@cryptoalpha'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;   // 1200
  const H = canvas.height;  // 628

  if (template === 'premium_banner') {
    drawPremiumBanner(ctx, W, H, tweetText);
    return;
  }

  const config = TEMPLATES[template];

  // ── Background Gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  config.background.forEach((color, i) => {
    bgGrad.addColorStop(i / (config.background.length - 1), color);
  });
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Pattern Overlay ──
  drawPattern(ctx, config.pattern, config.accentColor, W, H);

  // ── Accent Side Bar ──
  const barGrad = ctx.createLinearGradient(0, 0, 0, H);
  barGrad.addColorStop(0, config.accentColor);
  barGrad.addColorStop(1, config.accentColor + '00');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 6, H);

  // ── Badge ──
  const badgeX = 60;
  const badgeY = 60;
  const badgeW = 180;
  const badgeH = 42;
  const badgeRadius = 8;

  ctx.fillStyle = config.badgeColor + '33';
  ctx.strokeStyle = config.badgeColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeRadius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = config.badgeColor;
  ctx.font = 'bold 16px "Space Grotesk", "Arial", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(config.badgeText, badgeX + 16, badgeY + 27);

  // ── Main Tweet Text ──
  const textX = 60;
  const textY = 150;
  const maxWidth = W - 120;

  ctx.fillStyle = config.textColor;
  ctx.font = 'bold 42px "Space Grotesk", "Arial", sans-serif';

  const lines = wrapText(ctx, tweetText, maxWidth, 4);
  lines.forEach((line, i) => {
    ctx.fillText(line, textX, textY + i * 58);
  });

  // ── Glow effect under text ──
  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 400);
  glowGrad.addColorStop(0, config.accentColor + '15');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Bottom bar ──
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, H - 80, W, 80);

  // ── Handle ──
  ctx.fillStyle = config.accentColor;
  ctx.font = 'bold 22px "Space Grotesk", "Arial", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(handle, 60, H - 26);

  // ── X Logo watermark ──
  ctx.fillStyle = config.subtextColor + '80';
  ctx.font = 'bold 28px "Arial", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('𝕏', W - 60, H - 22);

  // ── Divider ──
  ctx.strokeStyle = config.accentColor + '40';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 80);
  ctx.lineTo(W, H - 80);
  ctx.stroke();
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: string,
  color: string,
  W: number,
  H: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  if (pattern === 'grid') {
    const spacing = 40;
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else if (pattern === 'dots') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.06;
    const spacing = 30;
    for (let x = 0; x < W; x += spacing) {
      for (let y = 0; y < H; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'waves') {
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 5) {
        const y = H * 0.3 + i * 80 + Math.sin(x / 80 + i) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) break;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    const lastLine = lines.length === maxLines - 1 && ctx.measureText(currentLine).width > maxWidth
      ? currentLine.slice(0, -3) + '...'
      : currentLine;
    lines.push(lastLine);
  }

  return lines;
}
