/* ══════════════════════════════════════════
   WEBCRAFT — MINIMAP
══════════════════════════════════════════ */

const Minimap = {
  _canvas: null,
  _ctx: null,
  _scale: 0.15,

  init() {
    this._canvas = document.getElementById('minimap-canvas');
    this._ctx = this._canvas?.getContext('2d');
    this.update();
  },

  update() {
    if (!this._canvas || !this._ctx) return;
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._doUpdate();
      this._raf = null;
    });
  },

  _doUpdate() {
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark ? '#0C0C10' : '#EAEAF2';
    ctx.fillRect(0, 0, w, h);

    // Find bounding box of all blocks
    if (State.blocks.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    State.blocks.forEach(b => {
      minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
    });

    const pad = 20;
    const contentW = maxX - minX + pad * 2;
    const contentH = maxY - minY + pad * 2;
    const scale = Math.min(w / contentW, h / contentH, 0.25);
    const offsetX = (w - contentW * scale) / 2 - minX * scale + pad * scale;
    const offsetY = (h - contentH * scale) / 2 - minY * scale + pad * scale;

    // Draw blocks
    State.blocks.forEach(b => {
      const bx = b.x * scale + offsetX;
      const by = b.y * scale + offsetY;
      const bw = b.w * scale;
      const bh = b.h * scale;
      const isSelected = State.selectedIds.includes(b.id);

      ctx.fillStyle = isSelected
        ? 'rgba(108,99,255,0.8)'
        : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)');
      ctx.fillRect(bx, by, Math.max(bw, 2), Math.max(bh, 2));
    });

    // Draw viewport indicator
    const vp = document.getElementById('canvas-viewport');
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const vpX = (-State.panX / State.zoom) * scale + offsetX;
    const vpY = (-State.panY / State.zoom) * scale + offsetY;
    const vpW = (rect.width / State.zoom) * scale;
    const vpH = (rect.height / State.zoom) * scale;

    ctx.strokeStyle = 'rgba(108,99,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.fillStyle = 'rgba(108,99,255,0.06)';
    ctx.fillRect(vpX, vpY, vpW, vpH);
  }
};
