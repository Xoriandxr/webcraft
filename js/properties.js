/* ══════════════════════════════════════════
   WEBCRAFT — PROPERTIES PANEL
══════════════════════════════════════════ */

const RightPanel = {
  _currentId: null,
  _currentTab: 'style',

  switchTab(tab) {
    this._currentTab = tab;
    document.querySelectorAll('#panel-right .ptab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (this._currentId) this.show(this._currentId);
  },

  show(id) {
    this._currentId = id;
    const block = State.getBlock(id);
    if (!block) { this.clear(); return; }

    const body = document.getElementById('prop-body');
    if (this._currentTab === 'style') body.innerHTML = this._buildStylePanel(block);
    else if (this._currentTab === 'content') body.innerHTML = this._buildContentPanel(block);
    else if (this._currentTab === 'nodes') body.innerHTML = this._buildNodesPanel(block);

    this._attachListeners(block);
  },

  showMulti() {
    this._currentId = null;
    document.getElementById('prop-body').innerHTML = `
      <div class="no-selection">
        <p style="color:var(--text-secondary);font-weight:600;">${State.selectedIds.length} blocks selected</p>
        <p>Shift+click to add/remove from selection</p>
      </div>`;
  },

  clear() {
    this._currentId = null;
    document.getElementById('prop-body').innerHTML = `
      <div class="no-selection">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M4 0l16 12-7 2-4 8L4 0z"/></svg>
        <p>Select a block to edit its properties</p>
      </div>`;
  },

  refresh() {
    if (this._currentId) this.show(this._currentId);
  },

  // ── STYLE PANEL ──
  _buildStylePanel(block) {
    return `
      ${this._group('Position & Size', true, `
        <div class="prop-row-2col">
          <div>
            <div class="prop-row"><span class="prop-label">X</span><input class="prop-input" type="number" data-prop="x" data-direct value="${block.x}" /></div>
            <div class="prop-mini-label">X</div>
          </div>
          <div>
            <div class="prop-row"><span class="prop-label">Y</span><input class="prop-input" type="number" data-prop="y" data-direct value="${block.y}" /></div>
            <div class="prop-mini-label">Y</div>
          </div>
        </div>
        <div class="prop-row-2col">
          <div>
            <div class="prop-row"><span class="prop-label">W</span><input class="prop-input" type="number" data-prop="w" data-direct value="${block.w}" /></div>
            <div class="prop-mini-label">Width</div>
          </div>
          <div>
            <div class="prop-row"><span class="prop-label">H</span><input class="prop-input" type="number" data-prop="h" data-direct value="${block.h}" /></div>
            <div class="prop-mini-label">Height</div>
          </div>
        </div>
      `)}
      ${this._group('Appearance', true, `
        <div class="prop-row"><span class="prop-label">Opacity</span>
          <input class="prop-input" type="range" data-prop="opacity" data-direct min="0" max="100" value="${block.opacity ?? 100}" />
          <span style="font-size:11px;color:var(--text-muted);width:32px;text-align:right;">${block.opacity ?? 100}%</span>
        </div>
        ${block.type === 'rect' || block.type === 'circle' ? `
          <div class="prop-row"><span class="prop-label">Fill</span><input class="prop-input" type="color" data-prop="props.bg" value="${block.props.bg || '#6C63FF'}" /></div>
        ` : ''}
        ${block.props.radius !== undefined ? `
          <div class="prop-row"><span class="prop-label">Radius</span>
            <input class="prop-input" type="range" data-prop="props.radius" min="0" max="100" value="${block.props.radius || 0}" />
            <span style="font-size:11px;color:var(--text-muted);width:32px;text-align:right;">${block.props.radius || 0}px</span>
          </div>
        ` : ''}
        ${block.props.bg !== undefined ? `
          <div class="prop-row"><span class="prop-label">BG</span><input class="prop-input" type="color" data-prop="props.bg" value="${block.props.bg || '#ffffff'}" /></div>
        ` : ''}
      `)}
      ${this._group('Layout', false, `
        <div class="prop-row"><span class="prop-label">Z-Index</span><input class="prop-input" type="number" data-prop="zIndex" data-direct value="${block.zIndex}" /></div>
        <div class="prop-row"><span class="prop-label">Lock</span>
          <button class="btn-ghost sm" style="width:100%;" onclick="Blocks.lockToggle('${block.id}')">${block.locked ? '🔒 Locked' : '🔓 Unlocked'}</button>
        </div>
        <div class="prop-row">
          <button class="btn-ghost sm" style="flex:1;" onclick="Blocks.bringForward('${block.id}')">↑ Forward</button>
          <button class="btn-ghost sm" style="flex:1;" onclick="Blocks.sendBackward('${block.id}')">↓ Back</button>
        </div>
      `)}
      <div style="padding:8px 0;">
        <button class="btn-ghost full-w" style="color:var(--danger);border-color:rgba(255,91,91,0.3);" onclick="Blocks.deleteSelected()">✕ Delete Block</button>
      </div>
    `;
  },

  // ── CONTENT PANEL ──
  _buildContentPanel(block) {
    const inputs = this._buildPropInputs(block);
    return inputs || `<div class="no-selection"><p>No editable content for this block type.</p></div>`;
  },

  _buildPropInputs(block) {
    const p = block.props;
    let html = '';

    // Text content
    if (p.text !== undefined) {
      html += `<div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
        <span class="prop-label">Text</span>
        <textarea class="prop-input" data-prop="props.text" rows="3" style="width:100%;resize:vertical;">${p.text}</textarea>
      </div>`;
    }

    // Logo / brand
    if (p.logo !== undefined) html += this._textRow('Logo', 'props.logo', p.logo);
    if (p.brand !== undefined) html += this._textRow('Brand', 'props.brand', p.brand);

    // Links / items
    if (p.links !== undefined) html += this._textareaRow('Links (one per line)', 'props.links', p.links);
    if (p.items !== undefined) html += this._textareaRow('Items', 'props.items', p.items);
    if (p.tabs !== undefined) html += this._textareaRow('Tabs (one per line)', 'props.tabs', p.tabs);
    if (p.columns !== undefined) html += this._textareaRow('Columns (use --- to separate)', 'props.columns', p.columns);
    if (p.features !== undefined) html += this._textareaRow('Features', 'props.features', p.features);
    if (p.options !== undefined) html += this._textareaRow('Options (one per line)', 'props.options', p.options);

    // Buttons
    if (p.btnText !== undefined) html += this._textRow('Button Text', 'props.btnText', p.btnText);
    if (p.btn2Text !== undefined) html += this._textRow('Button 2 Text', 'props.btn2Text', p.btn2Text);
    if (p.showBtn !== undefined) html += this._checkRow('Show Button', 'props.showBtn', p.showBtn);

    // Numbers
    if (p.value !== undefined) html += `<div class="prop-row"><span class="prop-label">Value %</span><input class="prop-input" type="number" min="0" max="100" data-prop="props.value" value="${p.value}" /></div>`;
    if (p.pages !== undefined) html += `<div class="prop-row"><span class="prop-label">Pages</span><input class="prop-input" type="number" min="1" max="20" data-prop="props.pages" value="${p.pages}" /></div>`;
    if (p.current !== undefined) html += `<div class="prop-row"><span class="prop-label">Current</span><input class="prop-input" type="number" min="1" data-prop="props.current" value="${p.current}" /></div>`;
    if (p.cols !== undefined) html += `<div class="prop-row"><span class="prop-label">Columns</span><input class="prop-input" type="number" min="1" max="12" data-prop="props.cols" value="${p.cols}" /></div>`;
    if (p.gap !== undefined) html += `<div class="prop-row"><span class="prop-label">Gap</span><input class="prop-input" type="number" min="0" data-prop="props.gap" value="${p.gap}" /></div>`;

    // Text props
    if (p.fontSize !== undefined) html += `<div class="prop-row"><span class="prop-label">Font Size</span><input class="prop-input" type="number" min="8" max="200" data-prop="props.fontSize" value="${p.fontSize}" /></div>`;
    if (p.fontWeight !== undefined) html += `
      <div class="prop-row"><span class="prop-label">Weight</span>
        <select class="prop-input" data-prop="props.fontWeight">
          <option value="300" ${p.fontWeight==300?'selected':''}>Light</option>
          <option value="400" ${p.fontWeight==400?'selected':''}>Regular</option>
          <option value="500" ${p.fontWeight==500?'selected':''}>Medium</option>
          <option value="600" ${p.fontWeight==600?'selected':''}>Semibold</option>
          <option value="700" ${p.fontWeight==700?'selected':''}>Bold</option>
          <option value="800" ${p.fontWeight==800?'selected':''}>Extrabold</option>
        </select>
      </div>`;
    if (p.align !== undefined) html += `
      <div class="prop-row"><span class="prop-label">Align</span>
        <div class="seg-control">
          <div class="seg-btn ${p.align==='left'?'active':''}" data-prop="props.align" data-val="left">←</div>
          <div class="seg-btn ${p.align==='center'?'active':''}" data-prop="props.align" data-val="center">⊞</div>
          <div class="seg-btn ${p.align==='right'?'active':''}" data-prop="props.align" data-val="right">→</div>
        </div>
      </div>`;
    if (p.color !== undefined) html += `<div class="prop-row"><span class="prop-label">Color</span><input class="prop-input" type="color" data-prop="props.color" value="${p.color || '#ffffff'}" /></div>`;

    // Image
    if (p.src !== undefined && block.type !== 'video') html += this._textRow('Image URL', 'props.src', p.src || '');
    if (p.src !== undefined && block.type === 'video') html += this._textRow('Video URL', 'props.src', p.src || '');
    if (p.alt !== undefined) html += this._textRow('Alt Text', 'props.alt', p.alt);
    if (p.href !== undefined) html += this._textRow('Link URL', 'props.href', p.href);
    if (p.placeholder !== undefined) html += this._textRow('Placeholder', 'props.placeholder', p.placeholder);

    // Avatar
    if (p.initials !== undefined) html += this._textRow('Initials', 'props.initials', p.initials);
    if (p.emoji !== undefined) html += this._textRow('Emoji / Icon', 'props.emoji', p.emoji);

    // Testimonial
    if (p.quote !== undefined) html += this._textareaRow('Quote', 'props.quote', p.quote);
    if (p.name !== undefined) html += this._textRow('Name', 'props.name', p.name);
    if (p.role !== undefined) html += this._textRow('Role', 'props.role', p.role);
    if (p.avatar !== undefined) html += this._textRow('Avatar Emoji', 'props.avatar', p.avatar);

    // Pricing
    if (p.plan !== undefined) html += this._textRow('Plan Name', 'props.plan', p.plan);
    if (p.price !== undefined) html += this._textRow('Price', 'props.price', p.price);
    if (p.period !== undefined) html += this._textRow('Period', 'props.period', p.period);

    // Toggle/checkbox
    if (p.on !== undefined) html += this._checkRow('Toggled On', 'props.on', p.on);
    if (p.checked !== undefined) html += this._checkRow('Checked', 'props.checked', p.checked);

    // Booleans
    if (p.sticky !== undefined) html += this._checkRow('Sticky Navbar', 'props.sticky', p.sticky);
    if (p.uppercase !== undefined) html += this._checkRow('Uppercase', 'props.uppercase', p.uppercase);
    if (p.highlight !== undefined) html += this._checkRow('Highlighted', 'props.highlight', p.highlight);
    if (p.center !== undefined) html += this._checkRow('Centered', 'props.center', p.center);
    if (p.wrap !== undefined) html += this._checkRow('Wrap Items', 'props.wrap', p.wrap);

    return html || `<div class="no-selection"><p>No content properties for this block.</p></div>`;
  },

  _textRow(label, prop, val) {
    return `<div class="prop-row"><span class="prop-label">${label}</span><input class="prop-input" type="text" data-prop="${prop}" value="${(val||'').replace(/"/g,'&quot;')}" /></div>`;
  },

  _textareaRow(label, prop, val) {
    return `<div class="prop-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
      <span class="prop-label">${label}</span>
      <textarea class="prop-input" data-prop="${prop}" rows="4" style="width:100%;resize:vertical;">${val||''}</textarea>
    </div>`;
  },

  _checkRow(label, prop, val) {
    return `<div class="prop-row"><span class="prop-label">${label}</span>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
        <input type="checkbox" data-prop="${prop}" ${val?'checked':''} style="accent-color:var(--accent);width:16px;height:16px;cursor:pointer;" />
      </label>
    </div>`;
  },

  // ── NODES PANEL ──
  _buildNodesPanel(block) {
    const conns = State.connections.filter(c => c.from === block.id || c.to === block.id);
    if (conns.length === 0) {
      return `<div class="nodes-panel-empty">
        <p>No connections yet.</p>
        <p style="margin-top:8px;">Switch to <strong>Connect</strong> tool (C) and drag from a port to another block to create a node connection.</p>
      </div>`;
    }
    return conns.map(c => {
      const other = State.getBlock(c.from === block.id ? c.to : c.from);
      const dir = c.from === block.id ? '→' : '←';
      const type = c.type || 'link';
      return `<div class="connection-item">
        <div class="connection-dot"></div>
        <span>${dir} ${other ? (BlockDefs[other.type]?.label || other.type) : 'Unknown'}</span>
        <span style="font-size:10px;color:var(--text-muted);margin-left:auto;">${type}</span>
        <button onclick="Nodes.removeConnection('${c.id}')" style="color:var(--danger);font-size:11px;padding:2px 6px;">✕</button>
      </div>`;
    }).join('');
  },

  _group(title, open, content) {
    return `<div class="prop-group">
      <div class="prop-group-header ${open ? 'open' : ''}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
        <span class="prop-group-title">${title}</span>
        <span class="prop-group-chevron">▾</span>
      </div>
      <div class="prop-group-body ${open ? 'open' : ''}">${content}</div>
    </div>`;
  },

  // ── LISTENERS ──
  _attachListeners(block) {
    const body = document.getElementById('prop-body');

    // All inputs
    body.querySelectorAll('[data-prop]').forEach(input => {
      const prop = input.dataset.prop;
      const isDirect = input.dataset.direct !== undefined;

      const apply = () => {
        let val = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'number' || input.type === 'range') val = parseFloat(val) || 0;

        // Update range label
        if (input.type === 'range') {
          const label = input.nextElementSibling;
          if (label) label.textContent = Math.round(val) + (prop.includes('opacity') ? '%' : 'px');
        }

        if (isDirect) {
          block[prop] = val;
        } else if (prop.startsWith('props.')) {
          const key = prop.replace('props.', '');
          block.props[key] = val;
        }

        Blocks.renderBlock(block);
        Nodes.updateConnections();
        Minimap.update();
        State.save();
      };

      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
    });

    // Segmented control clicks
    body.querySelectorAll('.seg-btn[data-prop]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prop = btn.dataset.prop;
        const val = btn.dataset.val;
        const key = prop.replace('props.', '');
        block.props[key] = val;
        btn.closest('.seg-control').querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        Blocks.renderBlock(block);
        State.save();
      });
    });

    // History on blur
    body.querySelectorAll('[data-prop]').forEach(input => {
      input.addEventListener('blur', () => History.snapshot());
    });
  }
};
