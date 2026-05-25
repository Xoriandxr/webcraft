/* ══════════════════════════════════════════
   WEBCRAFT — GLOBAL STATE
══════════════════════════════════════════ */

const State = {
  // Canvas
  zoom: 1,
  panX: 0,
  panY: 0,

  // Blocks
  blocks: [],
  selectedIds: [],
  clipboard: null,

  // Connections (node graph)
  connections: [],

  // Pages
  pages: [{ id: 'page-1', name: 'Home', blocks: [], connections: [] }],
  currentPage: 0,

  // Tools
  tool: 'select',  // select | pan | connect | text

  // Project
  projectName: 'Untitled Project',

  // ID counter
  _nextId: 1,
  nextId() { return 'block-' + (this._nextId++); },

  // Get selected blocks
  getSelected() {
    return this.blocks.filter(b => this.selectedIds.includes(b.id));
  },

  // Find block by id
  getBlock(id) {
    return this.blocks.find(b => b.id === id);
  },

  // Serialize current state
  serialize() {
    return {
      version: '1.0',
      projectName: this.projectName,
      pages: this.pages,
      currentPage: this.currentPage,
      blocks: this.blocks,
      connections: this.connections,
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY
    };
  },

  // Load from serialized
  load(data) {
    this.projectName = data.projectName || 'Untitled';
    this.pages = data.pages || [{ id: 'page-1', name: 'Home', blocks: [], connections: [] }];
    this.currentPage = data.currentPage || 0;
    this.blocks = data.blocks || [];
    this.connections = data.connections || [];
    this.zoom = data.zoom || 1;
    this.panX = data.panX || 0;
    this.panY = data.panY || 0;
    // Recalculate next ID
    let maxId = 0;
    this.blocks.forEach(b => {
      const num = parseInt(b.id.replace('block-', '')) || 0;
      if (num > maxId) maxId = num;
    });
    this._nextId = maxId + 1;
  },

  // Autosave
  save() {
    try {
      localStorage.setItem('wc-project', JSON.stringify(this.serialize()));
      document.getElementById('status-saved').textContent = 'Saved';
      setTimeout(() => {
        const el = document.getElementById('status-saved');
        if (el) el.textContent = 'All changes saved';
      }, 1500);
    } catch(e) {
      console.warn('Save failed', e);
    }
  },

  // Load from autosave
  loadAutosave() {
    try {
      const raw = localStorage.getItem('wc-project');
      if (raw) { this.load(JSON.parse(raw)); return true; }
    } catch(e) {}
    return false;
  }
};
