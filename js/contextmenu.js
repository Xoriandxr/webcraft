/* ══════════════════════════════════════════
   WEBCRAFT — CONTEXT MENU
══════════════════════════════════════════ */

const ContextMenu = {
  show(e) {
    const menu = document.getElementById('context-menu');
    menu.classList.remove('hidden');
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 260);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', () => this.hide(), { once: true });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hide(); }, { once: true });
    }, 10);
  },

  hide() {
    document.getElementById('context-menu').classList.add('hidden');
  },

  action(act) {
    this.hide();
    switch (act) {
      case 'duplicate': Blocks.duplicateSelected(); break;
      case 'copy': Blocks.copy(); break;
      case 'paste': Blocks.paste(); break;
      case 'delete': Blocks.deleteSelected(); break;
      case 'bringForward': Blocks.bringForward(); break;
      case 'sendBack': Blocks.sendBackward(); break;
      case 'lock': Blocks.lockToggle(); break;
      case 'group': App.toast('Group: coming in next version', 'info'); break;
    }
  }
};
