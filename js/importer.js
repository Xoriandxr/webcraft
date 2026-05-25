/* ══════════════════════════════════════════
   WEBCRAFT — HTML IMPORTER
   Parses real HTML and reconstructs blocks
══════════════════════════════════════════ */

const Importer = {

  handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('import-code').value = ev.target.result;
    };
    reader.readAsText(file);
  },

  handleDrop(e) {
    e.preventDefault();
    document.getElementById('import-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('import-code').value = ev.target.result;
      App.toast('File loaded — click Import & Parse', 'info');
    };
    reader.readAsText(file);
  },

  importFromCode() {
    const code = document.getElementById('import-code').value.trim();
    if (!code) { App.toast('Paste HTML code first', 'info'); return; }
    App.closeModal('modal-import');
    this._parseHTML(code);
  },

  _parseHTML(html) {
    App.toast('Parsing HTML…', 'info');

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Clear current blocks
    State.blocks = [];
    State.connections = [];
    State.selectedIds = [];

    let y = 40;
    const canvasW = 900;
    const blocks = [];

    // Helper
    const addBlock = (type, x, w, h, props) => {
      const def = BlockDefs[type];
      const block = {
        id: State.nextId(),
        type,
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(w),
        h: Math.round(h),
        props: { ...(def?.defaultProps || {}), ...props },
        zIndex: blocks.length + 1,
        locked: false,
        hidden: false,
        opacity: 100
      };
      blocks.push(block);
      State.blocks.push(block);
      y += h + 16;
      return block;
    };

    // ── PARSE NAVBAR / HEADER ──
    const header = doc.querySelector('header, nav, .navbar, .nav, [class*="header"], [class*="nav"]');
    if (header) {
      const logo = header.querySelector('.logo, .brand, h1, [class*="logo"]')?.textContent?.trim() || 'Brand';
      const links = [...header.querySelectorAll('a')].map(a => a.textContent.trim()).filter(Boolean);
      const btn = header.querySelector('button, .btn, [class*="btn"]')?.textContent?.trim() || '';
      addBlock('navbar', 0, canvasW, 60, {
        logo,
        links: links.slice(0, 6).join('\n'),
        showBtn: !!btn,
        btnText: btn || 'Get Started'
      });
    }

    // ── PARSE HERO ──
    const hero = doc.querySelector('.hero, [class*="hero"], section:first-of-type, .banner, .jumbotron');
    if (hero) {
      const h1 = hero.querySelector('h1, h2')?.textContent?.trim() || 'Welcome';
      const sub = hero.querySelector('p, .subtitle, .lead')?.textContent?.trim() || '';
      const btn = hero.querySelector('button, .btn, a[class*="btn"]')?.textContent?.trim() || 'Get Started';
      addBlock('hero', 0, canvasW, 380, {
        title: h1,
        subtitle: sub.substring(0, 200),
        btnText: btn
      });
    }

    // ── PARSE ALL SECTIONS ──
    const sections = doc.querySelectorAll('section, main > div, .section, [class*="section"]');
    sections.forEach((section) => {
      if (section === hero) return; // skip already processed
      const headings = section.querySelectorAll('h1,h2,h3,h4');
      const paragraphs = section.querySelectorAll('p');
      const cards = section.querySelectorAll('.card, [class*="card"], article');
      const buttons = section.querySelectorAll('button, .btn, a[class*="btn"]');
      const images = section.querySelectorAll('img');

      // Container
      const sectionH = 80 + headings.length * 60 + paragraphs.length * 50 + cards.length * 120;

      // Heading
      headings.forEach(h => {
        const text = h.textContent.trim();
        if (!text || text.length < 2) return;
        const isH1 = h.tagName === 'H1' || h.tagName === 'H2';
        addBlock('heading', 0, canvasW, isH1 ? 80 : 60, {
          text,
          fontSize: isH1 ? 36 : 24,
          tag: h.tagName.toLowerCase()
        });
      });

      // Paragraphs
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (!text || text.length < 5) return;
        const lines = Math.ceil(text.length / 80);
        addBlock('text', 0, canvasW * 0.8, Math.max(60, lines * 24 + 24), { text: text.substring(0, 500) });
        y += 4;
      });

      // Cards
      if (cards.length >= 2) {
        const cardW = Math.floor((canvasW - (cards.length - 1) * 16) / Math.min(cards.length, 3));
        const startY = y;
        let maxH = 0;
        [...cards].slice(0, 6).forEach((card, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const cardX = col * (cardW + 16);
          const title = card.querySelector('h3,h4,.card-title')?.textContent?.trim() || `Card ${i+1}`;
          const body = card.querySelector('p,.card-body,.card-text')?.textContent?.trim() || '';
          const cardH = 80 + (body ? 80 : 0);
          const block = {
            id: State.nextId(),
            type: 'card',
            x: cardX,
            y: startY + row * (cardH + 16),
            w: cardW,
            h: cardH,
            props: { ...BlockDefs.card.defaultProps, title, body },
            zIndex: State.blocks.length + 1,
            locked: false, hidden: false, opacity: 100
          };
          State.blocks.push(block);
          maxH = Math.max(maxH, block.y + block.h - startY);
        });
        y = startY + maxH + 16;
      } else {
        images.forEach(img => {
          const src = img.src || img.getAttribute('src') || '';
          addBlock('image', 0, Math.min(canvasW, 400), 250, {
            src: src.startsWith('http') ? src : '',
            alt: img.alt || ''
          });
        });
      }

      // Buttons
      buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if (!text) return;
        addBlock('button', 0, 180, 44, { text });
        y -= 4;
      });
    });

    // ── PARSE FOOTER ──
    const footer = doc.querySelector('footer, .footer, [class*="footer"]');
    if (footer) {
      const brand = footer.querySelector('.logo, .brand, h3, h4, strong')?.textContent?.trim() || 'Brand';
      const copy = footer.querySelector('.copyright, small, [class*="copy"]')?.textContent?.trim() || '';
      addBlock('footer', 0, canvasW, 180, { brand, copyright: copy || `© ${new Date().getFullYear()} ${brand}` });
    }

    // ── FALLBACK: parse by tag if nothing found ──
    if (State.blocks.length === 0) {
      doc.querySelectorAll('h1,h2,h3').forEach(el => {
        addBlock('heading', 40, 600, 70, { text: el.textContent.trim() || 'Heading' });
      });
      doc.querySelectorAll('p').forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 3) addBlock('text', 40, 600, 80, { text });
      });
      doc.querySelectorAll('button, input[type=submit]').forEach(el => {
        addBlock('button', 40, 180, 44, { text: el.textContent.trim() || 'Button' });
      });
    }

    // Render
    Blocks.renderAll();
    Canvas.fitView();
    History.snapshot();
    State.save();

    App.toast(`Imported ${State.blocks.length} blocks from HTML`, 'success');
  }
};
