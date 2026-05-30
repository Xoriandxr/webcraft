/* ══════════════════════════════════════════
   WEBCRAFT — NODE CONNECTIONS
══════════════════════════════════════════ */

const Nodes = {
  _drawing: false,
  _fromId: null,
  _fromPort: null,
  _tempLine: null,

  // ── START CONNECTION ──
  startConnection(e, blockId, port) {
    e.stopPropagation();
    this._drawing = true;
    this._fromId = blockId;
    this._fromPort = port;

    const svg = document.getElementById('connections-layer');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('stroke', 'var(--accent)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke-dasharray', '6 4');
    line.setAttribute('opacity', '0.8');
    line.id = 'temp-conn-line';
    svg.appendChild(line);
    this._tempLine = line;

    const startPos = this._getPortPosition(blockId, port);

    const onMove = (ev) => {
      if (!this._drawing) return;
      const pos = Canvas.screenToCanvas(ev.clientX, ev.clientY);
      const d = this._bezierPath(startPos.x, startPos.y, pos.x, pos.y);
      line.setAttribute('d', d);
    };

    const onUp = (ev) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (this._tempLine) { this._tempLine.remove(); this._tempLine = null; }
      this._drawing = false;

      // Find target block under mouse
      const { x: cx, y: cy } = Canvas.screenToCanvas(ev.clientX, ev.clientY);
      const target = State.blocks.find(b =>
        b.id !== this._fromId &&
        cx >= b.x && cx <= b.x + b.w &&
        cy >= b.y && cy <= b.y + b.h
      );
      if (target) {
        this.addConnection(this._fromId, target.id, this._fromPort, 'input');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  },

  // ── ADD CONNECTION ──
  addConnection(fromId, toId, fromPort, toPort) {
    // Avoid duplicates
    const exists = State.connections.find(c => c.from === fromId && c.to === toId);
    if (exists) return;

    const conn = {
      id: 'conn-' + Date.now(),
      from: fromId,
      to: toId,
      fromPort: fromPort || 'output',
      toPort: toPort || 'input',
      type: 'link',
      color: ''
    };
    State.connections.push(conn);
    this.renderAll();
    History.snapshot();
    State.save();
    App.toast('Connection created', 'success');
  },

  // ── REMOVE ──
  removeConnection(id) {
    State.connections = State.connections.filter(c => c.id !== id);
    this.renderAll();
    if (RightPanel._currentId) RightPanel.show(RightPanel._currentId);
    History.snapshot();
    State.save();
    App.toast('Connection removed', 'info');
  },

  // ── RENDER ALL CONNECTIONS ──
  renderAll() {
    const svg = document.getElementById('connections-layer');
    // Remove old paths (not temp)
    svg.querySelectorAll('.connection-path').forEach(p => p.remove());
    State.connections.forEach(c => this._drawConnection(c));
  },

  updateConnections() {
    this.renderAll();
  },

  _drawConnection(conn) {
    const svg = document.getElementById('connections-layer');
    const from = this._getPortPosition(conn.from, conn.fromPort);
    const to = this._getPortPosition(conn.to, conn.toPort);
    if (!from || !to) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('connection-path');
    path.setAttribute('d', this._bezierPath(from.x, from.y, to.x, to.y));
    path.setAttribute('stroke', conn.color || 'var(--connection)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.7');
    path.setAttribute('data-id', conn.id);

    // Hover to delete
    path.style.cursor = 'pointer';
    path.addEventListener('mouseenter', () => path.setAttribute('opacity', '1'));
    path.addEventListener('mouseleave', () => path.setAttribute('opacity', '0.7'));
    path.addEventListener('dblclick', () => {
      if (confirm('Remove this connection?')) this.removeConnection(conn.id);
    });

    svg.appendChild(path);

    // Arrow head
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arrow.classList.add('connection-path');
    arrow.setAttribute('cx', to.x);
    arrow.setAttribute('cy', to.y);
    arrow.setAttribute('r', '4');
    arrow.setAttribute('vector-effect', 'non-scaling-stroke');
    arrow.setAttribute('fill', conn.color || 'var(--connection)');
    arrow.setAttribute('opacity', '0.8');
    svg.appendChild(arrow);
  },

  _getPortPosition(blockId, port) {
    const block = State.getBlock(blockId);
    if (!block) return null;
    const bx = block.x;
    const by = block.y;
    const bw = block.w;
    const bh = block.h;

    switch (port) {
      case 'output': return { x: bx + bw, y: by + bh / 2 };
      case 'input':  return { x: bx, y: by + bh / 2 };
      case 'top':    return { x: bx + bw / 2, y: by };
      case 'bottom': return { x: bx + bw / 2, y: by + bh };
      default:       return { x: bx + bw, y: by + bh / 2 };
    }
  },

  _bezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1) * 0.5;
    const cp1x = x1 + dx;
    const cp2x = x2 - dx;
    return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
  }
};
