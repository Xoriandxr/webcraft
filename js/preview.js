/* ══════════════════════════════════════════
   WEBCRAFT — PREVIEW SYSTEM
══════════════════════════════════════════ */

const Preview = {
  _device: 'desktop',
  _mode: 'desktop', // topbar toggle

  setMode(mode) {
    this._mode = mode;
    document.querySelectorAll('.pvw-btn').forEach(b => b.classList.toggle('active', b.id === 'pvw-' + mode));
  },

  setDevice(device) {
    this._device = device;
    document.querySelectorAll('.pvw-tab').forEach(b =>
      b.classList.toggle('active', b.textContent.toLowerCase().includes(device))
    );
    const wrap = document.getElementById('preview-frame-wrap');
    if (wrap) {
      wrap.className = `preview-frame-wrap device-${device}`;
    }
    this.refresh();
  },

  openPreview() {
    document.getElementById('preview-project-name').textContent =
      (State.projectName || 'untitled').toLowerCase().replace(/\s+/g, '-');
    document.getElementById('modal-preview').classList.remove('hidden');
    this.setDevice(this._mode === 'mobile' ? 'mobile' : 'desktop');
    this.refresh();
  },

  refresh() {
    const iframe = document.getElementById('preview-frame');
    if (!iframe) return;
    try {
      const html = Exporter.generateHTML();
      const blob = new Blob([html], { type: 'text/html' });
      iframe.src = URL.createObjectURL(blob);
    } catch(e) {
      iframe.srcdoc = `<html><body style="font-family:sans-serif;padding:20px;color:#666;"><h3>Preview Error</h3><p>${e.message}</p></body></html>`;
    }
  }
};
