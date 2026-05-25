/* ══════════════════════════════════════════
   WEBCRAFT — HISTORY (UNDO/REDO)
══════════════════════════════════════════ */

const History = {
  stack: [],
  cursor: -1,
  maxSize: 50,
  _paused: false,

  push(snapshot) {
    if (this._paused) return;
    // Remove future states
    this.stack = this.stack.slice(0, this.cursor + 1);
    this.stack.push(JSON.stringify(snapshot));
    if (this.stack.length > this.maxSize) this.stack.shift();
    this.cursor = this.stack.length - 1;
  },

  undo() {
    if (this.cursor <= 0) { App.toast('Nothing to undo', 'info'); return; }
    this.cursor--;
    this._restore(JSON.parse(this.stack[this.cursor]));
    App.toast('Undone', 'info');
  },

  redo() {
    if (this.cursor >= this.stack.length - 1) { App.toast('Nothing to redo', 'info'); return; }
    this.cursor++;
    this._restore(JSON.parse(this.stack[this.cursor]));
    App.toast('Redone', 'info');
  },

  _restore(snapshot) {
    this._paused = true;
    State.blocks = snapshot.blocks.map(b => ({ ...b }));
    State.connections = snapshot.connections.map(c => ({ ...c }));
    Blocks.renderAll();
    Nodes.renderAll();
    this._paused = false;
  },

  snapshot() {
    this.push({
      blocks: State.blocks.map(b => ({ ...b })),
      connections: State.connections.map(c => ({ ...c }))
    });
  }
};
