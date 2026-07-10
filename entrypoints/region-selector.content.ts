/* ScreenKing — Region Selector Content Script */

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  registration: 'runtime',
  main() {
    let overlay: HTMLDivElement | null = null;
    let shadowRoot: ShadowRoot | null = null;
    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    // Listen for activation message
    browser.runtime.onMessage.addListener((message: any) => {
      if (message.type === 'CAPTURE_REGION') {
        showOverlay();
      }
    });

    function showOverlay() {
      if (overlay) return;

      overlay = document.createElement('div');
      overlay.id = 'screenking-region-overlay';
      shadowRoot = overlay.attachShadow({ mode: 'closed' });

      // Inject styles
      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
        }
        .sc-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          cursor: crosshair;
          background: rgba(0, 0, 0, 0.25);
          user-select: none;
          -webkit-user-select: none;
        }
        .sc-selection {
          position: absolute;
          border: 2px solid #f8b500;
          background: transparent;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
          pointer-events: none;
        }
        .sc-selection::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .sc-dimensions {
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 2px 8px;
          background: #f8b500;
          color: white;
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 500;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
        }
        .sc-toolbar {
          position: absolute;
          bottom: -60px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px;
          background: #0f0f1a;
          border: 2px solid #f8b500;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(248, 181, 0, 0.35), 0 12px 40px rgba(0, 0, 0, 0.5);
          pointer-events: auto;
          white-space: nowrap;
          animation: sc-toolbar-in 0.15s ease-out;
        }
        .sc-toolbar-top {
          bottom: auto;
          top: -60px;
        }
        @keyframes sc-toolbar-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .sc-toolbar button {
          margin: 0;
          border: none;
          outline: none;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          font-family: -apple-system, 'Segoe UI', sans-serif;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.12s ease;
          line-height: 1;
          text-decoration: none;
        }
        .sc-toolbar button:active {
          transform: scale(0.96);
        }
        .sc-toolbar button svg {
          flex-shrink: 0;
        }
        .sc-toolbar .sc-btn-confirm {
          background: #f8b500;
          color: #ffffff;
        }
        .sc-toolbar .sc-btn-confirm:hover {
          background: #7c74ff;
          box-shadow: 0 0 12px rgba(248, 181, 0, 0.4);
        }
        .sc-toolbar .sc-btn-cancel {
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .sc-toolbar .sc-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .sc-crosshair-h, .sc-crosshair-v {
          position: fixed;
          pointer-events: none;
          z-index: 1;
        }
        .sc-crosshair-h {
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(248, 181, 0, 0.5);
        }
        .sc-crosshair-v {
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(248, 181, 0, 0.5);
        }
        .sc-hint {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 12px 20px;
          background: rgba(12, 12, 20, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 13px;
          pointer-events: none;
          animation: sc-fade-in 0.2s ease;
        }
        .sc-hint kbd {
          display: inline-block;
          padding: 1px 5px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          font-family: monospace;
          font-size: 11px;
          margin: 0 2px;
        }
        @keyframes sc-fade-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `;
      shadowRoot.appendChild(style);

      // Create overlay
      const overlayEl = document.createElement('div');
      overlayEl.className = 'sc-overlay';
      shadowRoot.appendChild(overlayEl);

      // Crosshairs
      const crosshairH = document.createElement('div');
      crosshairH.className = 'sc-crosshair-h';
      overlayEl.appendChild(crosshairH);

      const crosshairV = document.createElement('div');
      crosshairV.className = 'sc-crosshair-v';
      overlayEl.appendChild(crosshairV);

      // Hint
      const hint = document.createElement('div');
      hint.className = 'sc-hint';
      hint.innerHTML = 'Click and drag to select area &nbsp;·&nbsp; Press <kbd>Esc</kbd> to cancel';
      overlayEl.appendChild(hint);

      // Selection box (hidden initially)
      const selection = document.createElement('div');
      selection.className = 'sc-selection';
      selection.style.display = 'none';
      overlayEl.appendChild(selection);

      // Dimensions label
      const dimensions = document.createElement('div');
      dimensions.className = 'sc-dimensions';
      selection.appendChild(dimensions);

      // Toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'sc-toolbar';
      toolbar.style.display = 'none';
      selection.appendChild(toolbar);

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'sc-btn-confirm';
      confirmBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Capture';
      confirmBtn.title = 'Capture selected area';
      toolbar.appendChild(confirmBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'sc-btn-cancel';
      cancelBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel';
      cancelBtn.title = 'Cancel';
      toolbar.appendChild(cancelBtn);

      // Event handlers
      overlayEl.addEventListener('mousedown', (e) => {
        if ((e.target as Element).closest('.sc-toolbar')) return;
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        selection.style.display = 'block';
        toolbar.style.display = 'none';
        hint.style.display = 'none';
        crosshairH.style.display = 'none';
        crosshairV.style.display = 'none';
        updateSelection(e.clientX, e.clientY);
      });

      overlayEl.addEventListener('mousemove', (e) => {
        if (isSelecting) {
          updateSelection(e.clientX, e.clientY);
        } else {
          // Move crosshairs
          crosshairH.style.top = e.clientY + 'px';
          crosshairV.style.left = e.clientX + 'px';
        }
      });

      overlayEl.addEventListener('mouseup', (e) => {
        if (!isSelecting) return;
        isSelecting = false;

        const rect = getSelectionRect(e.clientX, e.clientY);
        if (rect.width > 5 && rect.height > 5) {
          toolbar.style.display = 'flex';
          // Flip toolbar above selection if too close to bottom of viewport
          const viewportH = window.innerHeight;
          const selectionBottom = rect.top + rect.height;
          if (selectionBottom + 80 > viewportH) {
            toolbar.classList.add('sc-toolbar-top');
          } else {
            toolbar.classList.remove('sc-toolbar-top');
          }
        } else {
          selection.style.display = 'none';
          hint.style.display = 'block';
          crosshairH.style.display = 'block';
          crosshairV.style.display = 'block';
        }
      });

      confirmBtn.addEventListener('click', () => {
        const rect = selection.getBoundingClientRect();
        const bounds = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          devicePixelRatio: window.devicePixelRatio,
        };
        removeOverlay();
        // Send bounds to background
        browser.runtime.sendMessage({
          type: 'CAPTURE_REGION_RESULT',
          payload: bounds,
        });
      });

      cancelBtn.addEventListener('click', removeOverlay);

      // ESC to cancel
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          removeOverlay();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      function updateSelection(currentX: number, currentY: number) {
        const rect = getSelectionRect(currentX, currentY);
        selection.style.left = rect.left + 'px';
        selection.style.top = rect.top + 'px';
        selection.style.width = rect.width + 'px';
        selection.style.height = rect.height + 'px';
        dimensions.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
      }

      function getSelectionRect(currentX: number, currentY: number) {
        return {
          left: Math.min(startX, currentX),
          top: Math.min(startY, currentY),
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY),
        };
      }

      document.body.appendChild(overlay);
    }

    function removeOverlay() {
      if (overlay) {
        overlay.remove();
        overlay = null;
        shadowRoot = null;
        isSelecting = false;
      }
    }
  },
});
