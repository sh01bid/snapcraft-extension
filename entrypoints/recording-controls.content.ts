/* SnapCraft — Recording Controls Content Script */

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  registration: 'runtime',
  main() {
    let controlBar: HTMLDivElement | null = null;
    let shadowRoot: ShadowRoot | null = null;
    let startTime = 0;
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let isPaused = false;

    // Listen for activation
    browser.runtime.onMessage.addListener((message: any) => {
      if (message.type === 'SHOW_RECORDING_CONTROLS') {
        showControls();
      }
      if (message.type === 'HIDE_RECORDING_CONTROLS') {
        removeControls();
      }
    });

    function showControls() {
      if (controlBar) return;

      controlBar = document.createElement('div');
      controlBar.id = 'snapcraft-recording-controls';
      shadowRoot = controlBar.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
        }
        .sc-rec-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2147483647;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(12, 12, 20, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          font-family: 'Inter', -apple-system, sans-serif;
          user-select: none;
          -webkit-user-select: none;
          cursor: grab;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sc-rec-bar:active {
          cursor: grabbing;
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .sc-rec-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .sc-rec-dot.paused {
          animation: none;
          opacity: 0.5;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        .sc-rec-timer {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #f87171;
          min-width: 52px;
        }
        .sc-rec-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
        }
        .sc-rec-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.15s ease;
        }
        .sc-rec-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .sc-rec-btn.stop {
          background: #ef4444;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }
        .sc-rec-btn.stop:hover {
          background: #dc2626;
        }
        .sc-rec-btn svg {
          width: 18px;
          height: 18px;
        }
      `;
      shadowRoot.appendChild(style);

      const bar = document.createElement('div');
      bar.className = 'sc-rec-bar';
      shadowRoot.appendChild(bar);

      // Recording dot
      const dot = document.createElement('div');
      dot.className = 'sc-rec-dot';
      bar.appendChild(dot);

      // Timer
      const timer = document.createElement('span');
      timer.className = 'sc-rec-timer';
      timer.textContent = '00:00';
      bar.appendChild(timer);

      // Divider
      const divider = document.createElement('div');
      divider.className = 'sc-rec-divider';
      bar.appendChild(divider);

      // Pause/Resume button
      const pauseBtn = document.createElement('button');
      pauseBtn.className = 'sc-rec-btn';
      pauseBtn.title = 'Pause';
      pauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
      bar.appendChild(pauseBtn);

      // Stop button
      const stopBtn = document.createElement('button');
      stopBtn.className = 'sc-rec-btn stop';
      stopBtn.title = 'Stop Recording';
      stopBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
      bar.appendChild(stopBtn);

      // Start timer
      startTime = Date.now();
      timerInterval = setInterval(() => {
        if (!isPaused) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
          const s = (elapsed % 60).toString().padStart(2, '0');
          timer.textContent = `${m}:${s}`;
        }
      }, 1000);

      // Pause/Resume
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isPaused = !isPaused;
        dot.classList.toggle('paused', isPaused);
        if (isPaused) {
          pauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
          pauseBtn.title = 'Resume';
          browser.runtime.sendMessage({ type: 'PAUSE_RECORDING' });
        } else {
          pauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
          pauseBtn.title = 'Pause';
          browser.runtime.sendMessage({ type: 'RESUME_RECORDING' });
        }
      });

      // Stop
      stopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        browser.runtime.sendMessage({ type: 'STOP_RECORDING' });
        removeControls();
      });

      // Drag support
      let isDragging = false;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      bar.addEventListener('mousedown', (e) => {
        if ((e.target as Element).closest('.sc-rec-btn')) return;
        isDragging = true;
        const rect = bar.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        bar.style.left = (e.clientX - dragOffsetX) + 'px';
        bar.style.top = (e.clientY - dragOffsetY) + 'px';
        bar.style.bottom = 'auto';
        bar.style.transform = 'none';
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });

      document.body.appendChild(controlBar);
    }

    function removeControls() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (controlBar) {
        controlBar.remove();
        controlBar = null;
        shadowRoot = null;
      }
    }
  },
});
