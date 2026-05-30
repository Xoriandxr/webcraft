/* ══════════════════════════════════════════
   WEBCRAFT — CANVAS ENGINE
══════════════════════════════════════════ */

const Canvas = {
  _dragging: false,
  _panStart: null,
  _selRect: null,
  _selStart: null,

  init() {
    this.viewport = document.getElementById('canvas-viewport');
    this.stage = document.getElementById('canvas-stage');
    this.grid = document.getElementById('canvas-grid');
    this.zoomLabel = document.getElementById('zoom-label');
    this.applyTransform();

    // Keyboard shortcuts
    window.addEventListener('keydown', e => this.onKey(e));
    window.addEventListener('contextmenu', e => {
      if (e.target.closest('#canvas-viewport')) {
        e.preventDefault();
        ContextMenu.show(e);
      }
    });
  },

  // ── TOOL ──
  setTool(tool) {
    State.tool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tool-' + tool);
    if (btn) btn.classList.add('active');
    document.getElementById('status-tool').textContent = {
      select: 'Select', pan: 'Pan', connect: 'Connect Nodes', text: 'Text'
    }[tool] || tool;
    this.viewport.classList.toggle('pan-mode', tool === 'pan');
    this.viewport.classList.toggle('connect-mode', tool === 'connect');
  },

  // ── TRANSFORM ──
  applyTransform() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this.stage.style.transform = `translate(${State.panX}px, ${State.panY}px) scale(${State.zoom})`;
      this.zoomLabel.textContent = Math.round(State.zoom * 100) + '%';
      this._updateGrid();
      Minimap.update();
      this._raf = null;
    });
  },

  _updateGrid() {
    const sz = 20 * State.zoom;
    const szB = 100 * State.zoom;
    const ox = State.panX % sz;
    const oy = State.panY % sz;
    const oxB = State.panX % szB;
    const oyB = State.panY % szB;

    if (!this._smallGrid) {
      this._smallGrid = document.getElementById('smallGrid');
      this._smallGridPath = this._smallGrid?.querySelector('path');
      this._gridPattern = document.getElementById('grid');
      this._gridRect = this._gridPattern?.querySelector('rect');
      this._gridPath = this._gridPattern?.querySelector('path');
    }

    if (!this._smallGrid) return;

    this._smallGrid.setAttribute('width', sz);
    this._smallGrid.setAttribute('height', sz);
    this._smallGrid.setAttribute('x', ox);
    this._smallGrid.setAttribute('y', oy);
    this._smallGridPath?.setAttribute('d', `M ${sz} 0 L 0 0 0 ${sz}`);

    this._gridPattern.setAttribute('width', szB);
    this._gridPattern.setAttribute('height', szB);
    this._gridPattern.setAttribute('x', oxB);
    this._gridPattern.setAttribute('y', oyB);
    this._gridRect?.setAttribute('width', szB);
    this._gridRect?.setAttribute('height', szB);
    this._gridPath?.setAttribute('d', `M ${szB} 0 L 0 0 0 ${szB}`);
  },

  // ── ZOOM ──
  zoomIn()    { this.zoomTo(Math.min(State.zoom * 1.2, 5)); },
  zoomOut()   { this.zoomTo(Math.max(State.zoom / 1.2, 0.1)); },
  zoomReset() { this.zoomTo(1); },

  zoomTo(z, cx, cy) {
    const vp = this.viewport.getBoundingClientRect();
    const px = cx ?? vp.width / 2;
    const py = cy ?? vp.height / 2;
    const wsBefore = (px - State.panX) / State.zoom;
    const hsBefore = (py - State.panY) / State.zoom;
    State.zoom = z;
    State.panX = px - wsBefore * State.zoom;
    State.panY = py - hsBefore * State.zoom;
    this.applyTransform();
  },

  fitView() {
    if (State.blocks.length === 0) {
      State.zoom = 1; State.panX = 0; State.panY = 0;
      this.applyTransform(); return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    State.blocks.forEach(b => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w);
      maxY = Math.max(maxY, b.y + b.h);
    });
    const vp = this.viewport.getBoundingClientRect();
    const pad = 80;
    const scaleX = (vp.width - pad * 2) / (maxX - minX || 1);
    const scaleY = (vp.height - pad * 2) / (maxY - minY || 1);
    State.zoom = Math.max(0.1, Math.min(scaleX, scaleY, 2));
    State.panX = (vp.width - (maxX - minX) * State.zoom) / 2 - minX * State.zoom;
    State.panY = (vp.height - (maxY - minY) * State.zoom) / 2 - minY * State.zoom;
    this.applyTransform();
  },

  // ── WHEEL ──
  onWheel(e) {
    e.preventDefault();
    const rect = this.viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoomTo(Math.max(0.1, Math.min(5, State.zoom * delta)), cx, cy);
    } else {
      State.panX -= e.deltaX;
      State.panY -= e.deltaY;
      this.applyTransform();
    }
  },

  // ── MOUSE ──
  onMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && State.tool === 'pan')) {
      this._startPan(e); return;
    }
    if (e.button === 0 && State.tool === 'select') {
      if (e.target === this.viewport || e.target === this.stage ||
          e.target.classList.contains('canvas-grid') ||
          e.target.tagName === 'rect') {
        Blocks.deselectAll();
        this._startSelRect(e);
      }
    }
  },

  onMouseMove(e) {
    const rect = this.viewport.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - State.panX) / State.zoom);
    const y = Math.round((e.clientY - rect.top - State.panY) / State.zoom);
    document.getElementById('status-pos').textContent = `X: ${x}  Y: ${y}`;

    if (this._panStart) {
      State.panX += e.clientX - this._panStart.x;
      State.panY += e.clientY - this._panStart.y;
      this._panStart = { x: e.clientX, y: e.clientY };
      this.applyTransform();
      return;
    }
    if (this._selStart) {
      this._updateSelRect(e);
    }
  },

  onMouseUp(e) {
    if (this._panStart) {
      this.viewport.classList.remove('panning');
      this._panStart = null;
    }
    if (this._selStart) {
      this._endSelRect();
    }
  },

  _startPan(e) {
    this._panStart = { x: e.clientX, y: e.clientY };
    this.viewport.classList.add('panning');
  },

  _startSelRect(e) {
    const rect = this.viewport.getBoundingClientRect();
    this._selStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const sr = document.getElementById('selection-rect');
    sr.style.display = 'block';
    sr.style.left = this._selStart.x + 'px';
    sr.style.top = this._selStart.y + 'px';
    sr.style.width = '0';
    sr.style.height = '0';
  },

  _updateSelRect(e) {
    const rect = this.viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const x = Math.min(cx, this._selStart.x);
    const y = Math.min(cy, this._selStart.y);
    const w = Math.abs(cx - this._selStart.x);
    const h = Math.abs(cy - this._selStart.y);
    const sr = document.getElementById('selection-rect');
    sr.style.left = x + 'px';
    sr.style.top = y + 'px';
    sr.style.width = w + 'px';
    sr.style.height = h + 'px';
    this._selStart._rect = { x, y, w, h };
  },

  _endSelRect() {
    const sr = document.getElementById('selection-rect');
    sr.style.display = 'none';
    if (this._selStart._rect) {
      const { x, y, w, h } = this._selStart._rect;
      if (w > 4 && h > 4) {
        // Convert to canvas coords
        const cx = (x - State.panX) / State.zoom;
        const cy = (y - State.panY) / State.zoom;
        const cw = w / State.zoom;
        const ch = h / State.zoom;
        const ids = State.blocks
          .filter(b => b.x < cx + cw && b.x + b.w > cx && b.y < cy + ch && b.y + b.h > cy)
          .map(b => b.id);
        Blocks.selectMany(ids);
      }
    }
    this._selStart = null;
  },

  // Screen to canvas coords
  screenToCanvas(sx, sy) {
    const rect = this.viewport.getBoundingClientRect();
    return {
      x: (sx - rect.left - State.panX) / State.zoom,
      y: (sy - rect.top - State.panY) / State.zoom
    };
  },

  // ── KEYBOARD ──
  onKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); History.undo(); }
    if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); History.redo(); }
    if (mod && e.key === 'c') { e.preventDefault(); Blocks.copy(); }
    if (mod && e.key === 'v') { e.preventDefault(); Blocks.paste(); }
    if (mod && e.key === 'd') { e.preventDefault(); Blocks.duplicateSelected(); }
    if (mod && e.key === 'a') { e.preventDefault(); Blocks.selectAll(); }
    if (e.key === 'Delete' || e.key === 'Backspace') { Blocks.deleteSelected(); }
    if (e.key === 'v' || e.key === 'V') Canvas.setTool('select');
    if (e.key === 'h' || e.key === 'H') Canvas.setTool('pan');
    if (e.key === 'c' && !mod) Canvas.setTool('connect');
    if (e.key === 'f' || e.key === 'F') Canvas.fitView();
    if (e.key === '+' && mod) { e.preventDefault(); Canvas.zoomIn(); }
    if (e.key === '-' && mod) { e.preventDefault(); Canvas.zoomOut(); }
    // Arrow nudge
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const d = e.shiftKey ? 10 : 1;
      const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0;
      const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0;
      State.getSelected().forEach(b => { b.x += dx; b.y += dy; });
      Blocks.renderAll();
      State.save();
    }
  }
};
