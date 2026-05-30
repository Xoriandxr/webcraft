/* ══════════════════════════════════════════
   WEBCRAFT — BLOCKS ENGINE
══════════════════════════════════════════ */

const Blocks = {
  _dragType: null,
  _dragBlock: null,
  _dragOffsetX: 0,
  _dragOffsetY: 0,

  // ── CREATE ──
  create(type, x, y) {
    const def = BlockDefs[type];
    if (!def) { console.warn('Unknown block type:', type); return null; }
    const block = {
      id: State.nextId(),
      type,
      x: Math.round(x),
      y: Math.round(y),
      w: def.defaultW,
      h: def.defaultH,
      props: { ...def.defaultProps },
      zIndex: State.blocks.length + 1,
      locked: false,
      hidden: false,
      opacity: 100
    };
    State.blocks.push(block);
    this.renderBlock(block);
    History.snapshot();
    State.save();
    this.updateStatusBar();
    return block;
  },

  // ── RENDER ALL ──
  renderAll() {
    const stage = document.getElementById('canvas-stage');
    const existingIds = new Set(State.blocks.map(b => b.id));

    // Remove blocks that no longer exist
    [...stage.children].forEach(el => {
      if (el.classList.contains('wc-block') && !existingIds.has(el.id)) {
        el.remove();
      }
    });

    State.blocks.forEach(b => this.renderBlock(b));
    Nodes.updateConnections();
    this.updateStatusBar();
  },

  // ── RENDER ONE BLOCK ──
  renderBlock(block) {
    const stage = document.getElementById('canvas-stage');
    let el = document.getElementById(block.id);
    const isNew = !el;

    if (isNew) {
      el = document.createElement('div');
      el.id = block.id;
      // Events
      el.addEventListener('mousedown', (e) => this._blockMouseDown(e, block.id));
      el.addEventListener('dblclick', (e) => this._blockDblClick(e, block.id));
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.select(block.id);
        ContextMenu.show(e);
      });
    }

    const def = BlockDefs[block.type];
    const label = def ? def.label : block.type;
    const isSelected = State.selectedIds.includes(block.id);

    el.className = `wc-block block-type-${block.type}${block.locked ? ' locked' : ''}${block.hidden ? ' hidden' : ''}${isSelected ? ' selected' : ''}`;
    el.style.left = block.x + 'px';
    el.style.top = block.y + 'px';
    el.style.width = block.w + 'px';
    el.style.height = block.h + 'px';
    el.style.zIndex = block.zIndex;
    el.style.opacity = block.hidden ? 0 : (block.opacity || 100) / 100;

    // Only update innerHTML if necessary
    const contentKey = JSON.stringify(block.props) + isSelected + block.type;
    if (el.dataset.contentKey !== contentKey) {
      el.innerHTML = `
        <div class="block-label">${label}</div>
        ${def ? def.render(block) : `<div class="block-content">${block.type}</div>`}
        ${isSelected ? this._resizeHandles() : ''}
        ${isSelected ? this._nodePorts() : ''}
      `;
      el.dataset.contentKey = contentKey;
    }

    if (isNew) {
      stage.appendChild(el);
      el.classList.add('appearing');
      setTimeout(() => el.classList.remove('appearing'), 300);
    }
  },

  _resizeHandles() {
    return `
      <div class="resize-handle rh-tl" data-dir="tl"></div>
      <div class="resize-handle rh-tm" data-dir="tm"></div>
      <div class="resize-handle rh-tr" data-dir="tr"></div>
      <div class="resize-handle rh-ml" data-dir="ml"></div>
      <div class="resize-handle rh-mr" data-dir="mr"></div>
      <div class="resize-handle rh-bl" data-dir="bl"></div>
      <div class="resize-handle rh-bm" data-dir="bm"></div>
      <div class="resize-handle rh-br" data-dir="br"></div>
    `;
  },

  _nodePorts() {
    return `
      <div class="node-port port-output" data-port="output" data-id="${State.selectedIds[0]}"></div>
      <div class="node-port port-input" data-port="input" data-id="${State.selectedIds[0]}"></div>
      <div class="node-port port-top" data-port="top" data-id="${State.selectedIds[0]}"></div>
      <div class="node-port port-bottom" data-port="bottom" data-id="${State.selectedIds[0]}"></div>
    `;
  },

  // ── BLOCK MOUSE DOWN ──
  _blockMouseDown(e, id) {
    if (e.button !== 0) return;
    e.stopPropagation();

    // Handle resize
    if (e.target.classList.contains('resize-handle')) {
      this._startResize(e, id, e.target.dataset.dir);
      return;
    }

    // Handle node port
    if (e.target.classList.contains('node-port')) {
      Nodes.startConnection(e, id, e.target.dataset.port);
      return;
    }

    if (State.tool === 'connect') {
      Nodes.startConnection(e, id, 'output');
      return;
    }

    const block = State.getBlock(id);
    if (!block || block.locked) return;

    // Select
    if (e.shiftKey) {
      this.toggleSelect(id);
    } else if (!State.selectedIds.includes(id)) {
      this.select(id);
    }

    // Start drag
    this._startBlockDrag(e, id);
  },

  _blockDblClick(e, id) {
    // Double click opens text edit for text blocks
    const block = State.getBlock(id);
    if (!block) return;
    if (['heading', 'text', 'label', 'link'].includes(block.type)) {
      this._inlineEdit(id);
    }
  },

  // ── INLINE TEXT EDIT ──
  _inlineEdit(id) {
    const block = State.getBlock(id);
    if (!block) return;
    const el = document.getElementById(id);
    const content = el.querySelector('.block-content');
    if (!content) return;
    const old = block.props.text;
    content.contentEditable = 'true';
    content.focus();
    document.execCommand('selectAll');
    content.addEventListener('blur', () => {
      content.contentEditable = 'false';
      block.props.text = content.innerText;
      if (block.props.text !== old) {
        this.renderBlock(block);
        RightPanel.refresh();
        History.snapshot();
        State.save();
      }
    }, { once: true });
    content.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); content.blur(); }
      if (e.key === 'Escape') { block.props.text = old; content.blur(); }
    });
  },

  // ── DRAG BLOCK ──
  _startBlockDrag(e, id) {
    const block = State.getBlock(id);
    if (!block) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPositions = State.getSelected().map(b => ({ id: b.id, x: b.x, y: b.y }));

    const el = document.getElementById(id);
    el.classList.add('dragging');

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / State.zoom;
      const dy = (ev.clientY - startY) / State.zoom;
      startPositions.forEach(sp => {
        const b = State.getBlock(sp.id);
        if (!b) return;
        b.x = Math.round(sp.x + dx);
        b.y = Math.round(sp.y + dy);
        // Snap to grid (hold shift to disable)
        if (!ev.shiftKey) {
          b.x = Math.round(b.x / 8) * 8;
          b.y = Math.round(b.y / 8) * 8;
        }
        const bel = document.getElementById(b.id);
        if (bel) { bel.style.left = b.x + 'px'; bel.style.top = b.y + 'px'; }
      });
      Nodes.updateConnections();
      Minimap.update();
    };

    const onUp = () => {
      el.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      History.snapshot();
      State.save();
      RightPanel.refresh();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  },

  // ── RESIZE ──
  _startResize(e, id, dir) {
    e.stopPropagation();
    const block = State.getBlock(id);
    if (!block) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = block.x, origY = block.y, origW = block.w, origH = block.h;

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / State.zoom;
      const dy = (ev.clientY - startY) / State.zoom;
      const minW = 40, minH = 20;

      if (dir.includes('r')) block.w = Math.max(minW, Math.round(origW + dx));
      if (dir.includes('l')) { block.w = Math.max(minW, Math.round(origW - dx)); block.x = Math.round(origX + origW - block.w); }
      if (dir.includes('b')) block.h = Math.max(minH, Math.round(origH + dy));
      if (dir.includes('t')) { block.h = Math.max(minH, Math.round(origH - dy)); block.y = Math.round(origY + origH - block.h); }
      if (dir === 'tm' || dir === 'bm') block.w = origW;
      if (dir === 'ml' || dir === 'mr') block.h = origH;

      // Snap
      if (!ev.shiftKey) {
        block.w = Math.round(block.w / 8) * 8;
        block.h = Math.round(block.h / 8) * 8;
      }

      this.renderBlock(block);
      Nodes.updateConnections();
      RightPanel.refresh();
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      History.snapshot();
      State.save();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  },

  // ── DRAG FROM PANEL ──
  dragStart(e) {
    this._dragType = e.currentTarget.dataset.type;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', this._dragType);
    // Ghost
    const ghost = e.currentTarget.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.position = 'fixed';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => ghost.remove(), 0);
  },

  dropBlock(e) {
    e.preventDefault();
    const type = this._dragType || e.dataTransfer.getData('text/plain');
    if (!type || !BlockDefs[type]) return;
    const pos = Canvas.screenToCanvas(e.clientX, e.clientY);
    const def = BlockDefs[type];
    const x = pos.x - def.defaultW / 2;
    const y = pos.y - def.defaultH / 2;
    const block = this.create(type, x, y);
    if (block) { this.select(block.id); }
    this._dragType = null;
  },

  // Quick add via toolbar
  addBlock(type) {
    const vp = document.getElementById('canvas-viewport').getBoundingClientRect();
    const cx = (vp.width / 2 - State.panX) / State.zoom;
    const cy = (vp.height / 2 - State.panY) / State.zoom;
    const def = BlockDefs[type];
    if (!def) return;
    const block = this.create(type, cx - def.defaultW / 2, cy - def.defaultH / 2);
    if (block) this.select(block.id);
  },

  // ── SELECTION ──
  select(id) {
    State.selectedIds = [id];
    this.renderAll();
    RightPanel.show(id);
  },

  toggleSelect(id) {
    if (State.selectedIds.includes(id)) {
      State.selectedIds = State.selectedIds.filter(i => i !== id);
    } else {
      State.selectedIds.push(id);
    }
    this.renderAll();
    if (State.selectedIds.length === 1) RightPanel.show(State.selectedIds[0]);
    else RightPanel.showMulti();
  },

  selectMany(ids) {
    State.selectedIds = ids;
    this.renderAll();
    if (ids.length === 1) RightPanel.show(ids[0]);
    else if (ids.length > 1) RightPanel.showMulti();
  },

  selectAll() {
    State.selectedIds = State.blocks.map(b => b.id);
    this.renderAll();
    RightPanel.showMulti();
  },

  deselectAll() {
    State.selectedIds = [];
    this.renderAll();
    RightPanel.clear();
  },

  // ── OPERATIONS ──
  deleteSelected() {
    if (State.selectedIds.length === 0) return;
    State.selectedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('vanishing'); setTimeout(() => el.remove(), 200); }
      State.blocks = State.blocks.filter(b => b.id !== id);
      State.connections = State.connections.filter(c => c.from !== id && c.to !== id);
    });
    State.selectedIds = [];
    RightPanel.clear();
    Nodes.renderAll();
    History.snapshot();
    State.save();
    this.updateStatusBar();
    App.toast('Deleted', 'info');
  },

  duplicateSelected() {
    const copies = [];
    State.getSelected().forEach(b => {
      const copy = {
        ...JSON.parse(JSON.stringify(b)),
        id: State.nextId(),
        x: b.x + 20,
        y: b.y + 20,
        zIndex: State.blocks.length + 1
      };
      State.blocks.push(copy);
      copies.push(copy.id);
    });
    State.selectedIds = copies;
    this.renderAll();
    History.snapshot();
    State.save();
    App.toast('Duplicated', 'success');
  },

  copy() {
    State.clipboard = State.getSelected().map(b => JSON.parse(JSON.stringify(b)));
    App.toast(`Copied ${State.clipboard.length} block(s)`, 'info');
  },

  paste() {
    if (!State.clipboard || State.clipboard.length === 0) return;
    const newIds = [];
    State.clipboard.forEach(b => {
      const copy = { ...JSON.parse(JSON.stringify(b)), id: State.nextId(), x: b.x + 24, y: b.y + 24, zIndex: State.blocks.length + 1 };
      State.blocks.push(copy);
      newIds.push(copy.id);
    });
    State.selectedIds = newIds;
    this.renderAll();
    History.snapshot();
    State.save();
    App.toast('Pasted', 'success');
  },

  bringForward(id) {
    const block = State.getBlock(id || State.selectedIds[0]);
    if (!block) return;
    block.zIndex++;
    this.renderBlock(block);
  },

  sendBackward(id) {
    const block = State.getBlock(id || State.selectedIds[0]);
    if (!block) return;
    block.zIndex = Math.max(1, block.zIndex - 1);
    this.renderBlock(block);
  },

  lockToggle(id) {
    const block = State.getBlock(id || State.selectedIds[0]);
    if (!block) return;
    block.locked = !block.locked;
    this.renderBlock(block);
    App.toast(block.locked ? 'Block locked' : 'Block unlocked', 'info');
  },

  updateBlock(id, props) {
    const block = State.getBlock(id);
    if (!block) return;
    Object.assign(block.props, props);
    this.renderBlock(block);
    State.save();
  },

  updateStatusBar() {
    document.getElementById('status-blocks').textContent = State.blocks.length + ' blocks';
  }
};
