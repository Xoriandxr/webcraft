/* ══════════════════════════════════════════
   WEBCRAFT — MAIN APP CONTROLLER
══════════════════════════════════════════ */

const App = {

  init() {
    // Init all systems
    Canvas.init();
    Minimap.init();
    Pages.render();

    // Project name sync
    const nameInput = document.getElementById('project-name');
    nameInput.addEventListener('input', () => {
      State.projectName = nameInput.value;
      State.save();
    });

    // Check autosave
    const hasSave = State.loadAutosave();
    if (hasSave && State.blocks.length > 0) {
      this._showSplashRecent();
    }

    // Autosave timer
    setInterval(() => State.save(), 30000);

    // Setup preview buttons in topbar
    document.getElementById('pvw-desktop').addEventListener('click', () => Preview.setMode('desktop'));
    document.getElementById('pvw-mobile').addEventListener('click', () => Preview.setMode('mobile'));
  },

  startNew() {
    State.blocks = [];
    State.connections = [];
    State.selectedIds = [];
    State.pages = [{ id: 'page-1', name: 'Home', blocks: [], connections: [] }];
    State.currentPage = 0;
    State.projectName = 'Untitled Project';
    State.zoom = 1;
    State.panX = 60;
    State.panY = 60;

    document.getElementById('project-name').value = 'Untitled Project';

    this._hideSplash();
    Blocks.renderAll();
    Canvas.applyTransform();
    Pages.render();
    History.snapshot();

    // Add a welcome block
    setTimeout(() => {
      Blocks.create('hero', 60, 60);
      Blocks.create('navbar', 60, 10);
      Canvas.fitView();
    }, 100);
  },

  loadExisting() {
    State.loadAutosave();
    this._hideSplash();
    document.getElementById('project-name').value = State.projectName || 'Untitled Project';
    Blocks.renderAll();
    Nodes.renderAll();
    Canvas.applyTransform();
    Pages.render();
  },

  _hideSplash() {
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.02)';
    splash.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      splash.style.display = 'none';
      app.classList.remove('hidden');
      app.style.opacity = '0';
      app.style.transition = 'opacity 0.3s ease';
      setTimeout(() => app.style.opacity = '1', 20);
    }, 400);
  },

  _showSplashRecent() {
    const recent = document.getElementById('splash-recent');
    recent.innerHTML = `
      <button class="btn-ghost sm" onclick="App.loadExisting()" style="font-size:13px;padding:8px 16px;">
        ↩ Continue "${State.projectName || 'Last Project'}" (${State.blocks.length} blocks)
      </button>`;
  },

  goHome() {
    if (confirm('Go back to home? Unsaved changes are autosaved.')) {
      State.save();
      location.reload();
    }
  },

  // ── MODALS ──
  showImportModal() {
    document.getElementById('import-code').value = '';
    document.getElementById('import-file-input').value = '';
    document.getElementById('modal-import').classList.remove('hidden');
  },

  exportHTML() {
    Exporter.open();
    document.getElementById('modal-export').classList.remove('hidden');
    Exporter._updatePreview();
  },

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  },

  // ── TOAST NOTIFICATIONS ──
  toast(message, type = 'info') {
    const stack = document.getElementById('toast-stack');
    const el = document.createElement('div');
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '·'}</span> ${message}`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, 2500);
  }
};

// ── BOOT ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
