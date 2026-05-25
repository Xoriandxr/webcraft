/* ══════════════════════════════════════════
   WEBCRAFT — LEFT PANEL
══════════════════════════════════════════ */

const LeftPanel = {
  _currentTab: 'elements',

  switchTab(tab) {
    this._currentTab = tab;
    document.querySelectorAll('#panel-left .ptab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab)
    );
    document.querySelectorAll('#panel-left .tab-content').forEach(tc =>
      tc.classList.toggle('active', tc.id === 'tab-' + tab)
    );
    if (tab === 'pages') Pages.render();
  },

  search(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.block-item').forEach(item => {
      const name = item.querySelector('span')?.textContent?.toLowerCase() || '';
      const type = item.dataset.type || '';
      item.style.display = (!q || name.includes(q) || type.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('.block-section').forEach(sec => {
      const visible = [...sec.querySelectorAll('.block-item')].some(i => i.style.display !== 'none');
      sec.style.display = visible ? '' : 'none';
    });
  }
};
