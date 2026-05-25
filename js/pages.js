/* ══════════════════════════════════════════
   WEBCRAFT — PAGES MANAGER
══════════════════════════════════════════ */

const Pages = {
  render() {
    const container = document.getElementById('pages-manager');
    if (!container) return;
    container.innerHTML = State.pages.map((page, i) => `
      <div class="page-item ${i === State.currentPage ? 'active' : ''}" onclick="Pages.switchTo(${i})">
        <span class="page-item-icon">📄</span>
        <span class="page-item-name" contenteditable="true"
          onblur="Pages.rename(${i}, this.textContent)"
          onclick="event.stopPropagation()"
          onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
        >${page.name}</span>
        ${State.pages.length > 1 ? `<button onclick="event.stopPropagation();Pages.deletePage(${i})" style="color:var(--danger);font-size:12px;opacity:0.6;" title="Delete page">✕</button>` : ''}
      </div>
    `).join('');
    document.getElementById('status-page').textContent = `Page ${State.currentPage + 1}/${State.pages.length}`;
  },

  switchTo(index) {
    // Save current page state
    State.pages[State.currentPage].blocks = JSON.parse(JSON.stringify(State.blocks));
    State.pages[State.currentPage].connections = JSON.parse(JSON.stringify(State.connections));

    // Load new page
    State.currentPage = index;
    State.blocks = JSON.parse(JSON.stringify(State.pages[index].blocks || []));
    State.connections = JSON.parse(JSON.stringify(State.pages[index].connections || []));

    Blocks.renderAll();
    Nodes.renderAll();
    Blocks.deselectAll();
    this.render();
    State.save();
    App.toast(`Switched to ${State.pages[index].name}`, 'info');
  },

  addPage() {
    const name = `Page ${State.pages.length + 1}`;
    State.pages.push({ id: 'page-' + Date.now(), name, blocks: [], connections: [] });
    this.switchTo(State.pages.length - 1);
    this.render();
    App.toast(`Added ${name}`, 'success');
  },

  deletePage(index) {
    if (State.pages.length <= 1) { App.toast('Cannot delete last page', 'info'); return; }
    if (!confirm(`Delete "${State.pages[index].name}"?`)) return;
    State.pages.splice(index, 1);
    const newIdx = Math.min(State.currentPage, State.pages.length - 1);
    this.switchTo(newIdx);
    this.render();
  },

  rename(index, name) {
    State.pages[index].name = name.trim() || `Page ${index + 1}`;
    this.render();
    State.save();
  }
};
