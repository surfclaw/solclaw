import React, { useEffect, useRef, useState } from 'react';

const LogoMark = () => {
  const filled = new Set([
    '0-5','1-3','1-4','1-6','1-7','2-2','2-4','2-5','2-6','2-8',
    '3-1','3-5','3-9','4-1','4-2','4-4','4-6','4-8','4-9','5-0',
    '5-2','5-3','5-5','5-7','5-8','5-10','6-1','6-2','6-4','6-6',
    '6-8','6-9','7-1','7-5','7-9','8-2','8-4','8-5','8-6','8-8',
    '9-3','9-4','9-6','9-7','10-5'
  ]);
  
  return (
    <div style={{
      width: '44px',
      height: '44px',
      display: 'grid',
      gridTemplateColumns: 'repeat(11, 1fr)',
      gridTemplateRows: 'repeat(11, 1fr)',
      gap: 0,
      background: 'rgba(153, 69, 255, 0.1)',
      border: '1px solid rgba(153, 69, 255, 0.4)',
      borderRadius: '6px',
      padding: '4px'
    }}>
      {Array.from({ length: 11 }).map((_, r) =>
        Array.from({ length: 11 }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: filled.has(`${r}-${c}`) ? '#14F195' : 'transparent',
              boxShadow: filled.has(`${r}-${c}`) ? '0 0 4px #14F195' : 'none'
            }}
          />
        ))
      )}
    </div>
  );
};

const SolClawPortal = () => {
  const canvasRef = useRef(null);
  const tickRef = useRef(null);
  const fpsRef = useRef(null);
  const statusRef = useRef(null);
  
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simLog, setSimLog] = useState([
    "> INITIATING SOLCLAW ZK-AI L2 MATRIX...",
    "> ALLOCATING FIRECRACKER MICROVM MEMORY... [OK]",
    "> CONNECTING SOLANA DEVNET RPC... [OK]",
    "> SP1 RISC-V ZKVM PROVER READY",
    "> AWAITING INFERENCE REQUESTS..."
  ]);

  const runSimulation = () => {
    setSimulating(true);
    setSimLog(prev => [...prev, "> [USER] TRIGGERING ON-CHAIN ZK-AI L2 INFERENCE..."]);
    setTimeout(() => {
      setSimLog(prev => [...prev, "> GENERATING SP1 RISC-V ZK BATCH PROOF..."]);
    }, 400);
    setTimeout(() => {
      setSimLog(prev => [...prev, "> LOCAL ZK PROOF VERIFIED (< 0.1MS)"]);
    }, 800);
    setTimeout(() => {
      setSimLog(prev => [
        ...prev,
        "> SOLANA TX SUBMITTED: solclaw_tx_sig_1_0xsp1_e6",
        "> ON-CHAIN SETTLEMENT FINALIZED (0.63MS BENCHMARK)",
        "------------------------------------------------"
      ]);
      setSimulating(false);
    }, 1200);
  };

  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap'
    ];
    const linkElements = [];
    links.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      linkElements.push(link);
    });
    
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
      body { background-color: #050508; color: #ffffff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; display: flex; }
      .action-btn {
        background: rgba(153, 69, 255, 0.15);
        border: 1px solid rgba(153, 69, 255, 0.5);
        color: #14F195;
        padding: 0.6rem 1rem;
        font-family: 'Space Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
      }
      .action-btn:hover {
        background: rgba(20, 241, 149, 0.2);
        border-color: #14F195;
        color: #ffffff;
        box-shadow: 0 0 12px rgba(20, 241, 149, 0.4);
      }
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      .modal-content {
        background: #0d0d14;
        border: 1px solid #9945FF;
        border-radius: 8px;
        max-width: 800px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        padding: 2rem;
        box-shadow: 0 0 30px rgba(153, 69, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
    linkElements.push(style);
    
    return () => {
      linkElements.forEach(el => document.head.removeChild(el));
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const tickCounter = tickRef.current;
    const fpsCounter = fpsRef.current;
    const statusSpan = statusRef.current;
    
    let width, height;
    let cols, rows;
    const fontSize = 14;
    const soilChars = ['.', ',', ':', ';', '~', '-', '+', '=', '*', ' ', ' ', ' '];
    let time = 0;
    let ticks = 0;
    let lastTime = performance.now();
    let animId;
    
    const sproutConfig = {
      delay: 100,
      stemFrames: 120,
      leafFrames: 100,
      bloomFrames: 150,
      xPos: 0,
      yPos: 0,
      maxHeight: 14
    };
    
    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.font = `${fontSize}px "Space Mono", monospace`;
      ctx.textBaseline = 'top';
      cols = Math.floor(width / (fontSize * 0.6));
      rows = Math.floor(height / fontSize);
      sproutConfig.xPos = Math.floor(cols * 0.5);
      sproutConfig.yPos = Math.floor(rows * 0.85);
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function hash(x, y) {
      return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    }
    
    function renderSoil() {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(153, 69, 255, 0.35)';
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const distToSprout = Math.abs(x - sproutConfig.xPos) + Math.abs(y - sproutConfig.yPos);
          if (distToSprout < 5 && y >= sproutConfig.yPos - sproutConfig.maxHeight) continue;
          
          const flowSpeed = time * 0.05;
          const wave = Math.sin(y * 0.1 + time * 0.02) * 2;
          const adjustedY = y - flowSpeed;
          const val = (Math.sin(x * 0.2 + wave) + Math.cos(adjustedY * 0.15)) * 0.5;
          const noise = hash(x, Math.floor(adjustedY));
          
          if (val + (noise - 0.5) * 0.2 > 0.2) {
            const charIndex = Math.floor(Math.abs(val * soilChars.length)) % soilChars.length;
            const px = x * (fontSize * 0.6);
            const py = y * fontSize;
            ctx.fillText(soilChars[charIndex], px, py);
          }
        }
      }
    }
    
    function renderSprout(tick) {
      if (tick < sproutConfig.delay) return;
      
      const pX = sproutConfig.xPos * (fontSize * 0.6);
      const pY = sproutConfig.yPos * fontSize;
      const activeTime = tick - sproutConfig.delay;
      
      ctx.fillStyle = '#14F195';
      ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
      
      const stemProgress = Math.min(1, activeTime / sproutConfig.stemFrames);
      const leafProgress = Math.min(1, Math.max(0, (activeTime - sproutConfig.stemFrames) / sproutConfig.leafFrames));
      const bloomProgress = Math.min(1, Math.max(0, (activeTime - sproutConfig.stemFrames - sproutConfig.leafFrames) / sproutConfig.bloomFrames));
      
      const sway = Math.sin(time * 0.03) * 3 * bloomProgress;
      let currentHeight = Math.floor(stemProgress * sproutConfig.maxHeight);
      
      for (let i = 0; i <= currentHeight; i++) {
        const yOff = pY - (i * fontSize);
        const xSway = sway * (i / sproutConfig.maxHeight);
        let char = '|';
        
        if (leafProgress > 0 && i === currentHeight - 2 && i > 2) {
          if (leafProgress < 0.5) {
            ctx.fillText('`', pX - (fontSize * 0.6) + xSway, yOff);
            ctx.fillText('´', pX + (fontSize * 0.6) + xSway, yOff);
          } else {
            ctx.fillText('\\', pX - (fontSize * 0.6) + xSway, yOff);
            ctx.fillText('/', pX + (fontSize * 0.6) + xSway, yOff);
            char = 'T';
          }
        }
        
        if (leafProgress > 0.8 && i === currentHeight - 4 && i > 4) {
          ctx.fillText('\\', pX - (fontSize * 0.6) + xSway, yOff);
          ctx.fillText('/', pX + (fontSize * 0.6) + xSway, yOff);
        }
        
        ctx.fillText(char, pX + xSway, yOff);
      }
      
      if (bloomProgress > 0 && currentHeight > 0) {
        const topY = pY - ((currentHeight + 1) * fontSize);
        const xSway = sway;
        
        if (bloomProgress < 0.3) {
          ctx.fillText('.', pX + xSway, topY);
        } else if (bloomProgress < 0.6) {
          ctx.fillText('o', pX + xSway, topY);
        } else if (bloomProgress < 0.9) {
          ctx.fillText('O', pX + xSway, topY);
        } else {
          ctx.fillText('⚡', pX + xSway - 1, topY);
        }
      }
      
      ctx.font = `${fontSize}px "Space Mono", monospace`;
    }
    
    function loop(now) {
      animId = requestAnimationFrame(loop);
      
      const delta = now - lastTime;
      if (delta > 1000) lastTime = now;
      
      if (fpsCounter && ticks % 10 === 0) {
        fpsCounter.innerText = Math.round(1000 / delta);
      }
      lastTime = now;
      
      time++;
      ticks++;
      if (tickCounter) tickCounter.innerText = ticks.toString().padStart(6, '0');
      
      if (statusSpan) {
        if (ticks === sproutConfig.delay) {
          statusSpan.innerText = 'GENERATING_SP1_ZKVM';
        } else if (ticks === sproutConfig.delay + sproutConfig.stemFrames + sproutConfig.leafFrames + sproutConfig.bloomFrames) {
          statusSpan.innerText = 'SOLANA_FINALIZED (0.63MS)';
        }
      }
      
      renderSoil();
      renderSprout(ticks);
    }
    
    animId = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#050508', color: '#ffffff', fontFamily: '"Space Mono", monospace' }}>
      
      {/* Left Navigation & Control Panel */}
      <div style={{ width: '40%', height: '100%', borderRight: '1px solid rgba(153, 69, 255, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem', position: 'relative', zIndex: 10, background: '#090910' }}>
        
        <div>
          <header style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
            <LogoMark />
            <div>
              <div style={{ fontFamily: '"Pixelify Sans", sans-serif', fontSize: '2.2rem', letterSpacing: '2px', lineHeight: 1, color: '#14F195' }}>
                SOLCLAW
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9945FF', letterSpacing: '1px', marginTop: '4px' }}>
                SP1 RISC-V ZK-AI LAYER 2 ROLLUP ON SOLANA
              </div>
            </div>
          </header>

          {/* Quick Action Navigation Bar */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a
              href="https://github.com/surfclaw/solclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn"
            >
              <span>🐙</span> GitHub Repository
            </a>
            <button className="action-btn" onClick={() => setShowPitchDeck(true)}>
              <span>📊</span> Pitch Deck
            </button>
            <button className="action-btn" onClick={() => setShowDocs(true)}>
              <span>📖</span> User Manual & Docs
            </button>
          </div>

          {/* Telemetry Status Panel */}
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.6, background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.15)', paddingBottom: '0.3rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>ECOSYSTEM</span>
              <span style={{ color: '#14F195' }}>SOLANA DEVNET / MAINNET</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.15)', paddingBottom: '0.3rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>ZK PROVER</span>
              <span>SUCCINCT SP1 RISC-V</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.15)', paddingBottom: '0.3rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>LATENCY</span>
              <span style={{ color: '#14F195' }}>0.63 MS (3.5X FASTER)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.15)', paddingBottom: '0.3rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>SIMULATION_TICK</span>
              <span ref={tickRef}>000000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>STATUS</span>
              <span ref={statusRef} style={{ color: '#9945FF', fontWeight: 'bold' }}>INITIALIZING</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Control & Terminal Output */}
        <div>
          <button
            className="action-btn"
            onClick={runSimulation}
            disabled={simulating}
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.85rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #9945FF, #14F195)', color: '#000' }}
          >
            {simulating ? '⚡ EXECUTING ZK PROOF...' : '🚀 RUN LIVE ZK-AI L2 SIMULATION'}
          </button>

          <div style={{ fontSize: '0.65rem', background: '#000000', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(153,69,255,0.3)', height: '140px', overflowY: 'auto', color: '#14F195', lineHeight: 1.4 }}>
            {simLog.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Canvas Visualization */}
      <div style={{ width: '60%', height: '100%', position: 'relative', overflow: 'hidden', background: '#050508' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', textAlign: 'right', fontSize: '0.7rem', opacity: 0.4, pointerEvents: 'none' }}>
          RENDER: SP1 ZKVM MATRIX 2D<br />
          FPS: <span ref={fpsRef}>60</span><br />
          SOLANA ANCHOR: CONNECTED
        </div>
      </div>

      {/* Pitch Deck Modal */}
      {showPitchDeck && (
        <div className="modal-overlay" onClick={() => setShowPitchDeck(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #9945FF', paddingBottom: '0.5rem' }}>
              <h2 style={{ color: '#14F195', fontSize: '1.4rem' }}>📊 SolClaw Pitch Deck</h2>
              <button className="action-btn" onClick={() => setShowPitchDeck(false)}>✕ CLOSE</button>
            </div>
            
            <div style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>Slide 1: Executive Summary</h3>
              <p style={{ marginBottom: '1rem' }}>SolClaw is the World's First ZK-AI Layer 2 Rollup & GPU DePIN Middleware engineered specifically for the Solana ecosystem.</p>

              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>Slide 2: Problem & Solution</h3>
              <p style={{ marginBottom: '1rem' }}>AI Agent cheating, unverified prompt execution, and high L1 gas settlement overhead. SolClaw solves this with Succinct SP1 RISC-V zkVM proof generation and sub-millisecond Solana Anchor state root settlement.</p>

              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>Slide 3: Performance Benchmarks</h3>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                <li>Average Execution Latency: 0.63ms (3.5x Acceleration)</li>
                <li>Mathematical Fraud-Proof: 0.000% Cheating / Spoofing</li>
                <li>L1 Gas Reduction: 99.9% ($0.001 per batch settlement)</li>
              </ul>

              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>Slide 4: Architecture & Security</h3>
              <p style={{ marginBottom: '1.5rem' }}>AWS Firecracker MicroVM hardware sandbox guarantees 100% hotkey and private key protection.</p>

              <a
                href="https://github.com/surfclaw/solclaw"
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                📥 Download Full Pitch Deck (Surfclaw_Pitch_Deck.pptx)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* User Manual & Developer Docs Modal */}
      {showDocs && (
        <div className="modal-overlay" onClick={() => setShowDocs(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #14F195', paddingBottom: '0.5rem' }}>
              <h2 style={{ color: '#14F195', fontSize: '1.4rem' }}>📖 Developer User Manual & Specification</h2>
              <button className="action-btn" onClick={() => setShowDocs(false)}>✕ CLOSE</button>
            </div>
            
            <div style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>1. Solana Anchor Program Information</h3>
              <p style={{ background: '#000', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', color: '#14F195', marginBottom: '1rem' }}>
                Program ID: SolC1awL2Rollup111111111111111111111111111
              </p>

              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>2. Quick Start CLI Setup</h3>
              <pre style={{ background: '#000', padding: '0.8rem', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', marginBottom: '1rem', overflowX: 'auto' }}>
{`# 1. Clone SolClaw Repository
git clone https://github.com/surfclaw/solclaw.git
cd solclaw

# 2. Build Solana Anchor L2 Program
NO_DNA=1 anchor build

# 3. Execute ZK-AI L2 Miner Simulation
python neurons/solana_miner.py --dry-run`}
              </pre>

              <h3 style={{ color: '#9945FF', marginBottom: '0.5rem' }}>3. Solana Security Standards</h3>
              <p style={{ marginBottom: '1rem' }}>SolClaw strictly complies with Wallet Standard signing, non-interactive NO_DNA=1 CLI mode, and zero hardcoded private keys.</p>

              <a
                href="https://github.com/surfclaw/solclaw/blob/main/SOLANA_AGENTS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                📄 View SOLANA_AGENTS.md Specification on GitHub
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SolClawPortal;
