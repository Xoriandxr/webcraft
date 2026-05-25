/* ══════════════════════════════════════════
   WEBCRAFT — THEME MANAGER
══════════════════════════════════════════ */

const Theme = {
  current: 'dark',

  init() {
    const saved = localStorage.getItem('wc-theme') || 'dark';
    this.apply(saved);
  },

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  },

  apply(theme) {
    this.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wc-theme', theme);
  }
};

Theme.init();
