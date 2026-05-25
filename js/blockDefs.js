/* ══════════════════════════════════════════
   WEBCRAFT — BLOCK DEFINITIONS
   Each type: { label, defaultW, defaultH, defaultProps, render(block) }
══════════════════════════════════════════ */

const BlockDefs = {

  heading: {
    label: 'Heading',
    defaultW: 400, defaultH: 70,
    defaultProps: { text: 'Your Heading', fontSize: 32, fontWeight: 800, color: '', align: 'center', tag: 'h1' },
    render: (b) => `<div class="block-content" style="font-size:${b.props.fontSize}px;font-weight:${b.props.fontWeight};color:${b.props.color||'var(--text-primary)'};text-align:${b.props.align};font-family:var(--font-display);">${b.props.text}</div>`
  },

  text: {
    label: 'Text',
    defaultW: 300, defaultH: 80,
    defaultProps: { text: 'Your paragraph text goes here. Click to edit.', fontSize: 14, color: '', align: 'left', lineHeight: 1.6 },
    render: (b) => `<div class="block-content" style="font-size:${b.props.fontSize}px;color:${b.props.color||'var(--text-secondary)'};text-align:${b.props.align};line-height:${b.props.lineHeight};padding:10px 14px;align-items:flex-start;">${b.props.text}</div>`
  },

  label: {
    label: 'Label',
    defaultW: 150, defaultH: 36,
    defaultProps: { text: 'Label', fontSize: 11, color: '', letterSpacing: '0.06em', uppercase: true },
    render: (b) => `<div class="block-content" style="font-size:${b.props.fontSize}px;color:${b.props.color||'var(--text-muted)'};letter-spacing:${b.props.letterSpacing};text-transform:${b.props.uppercase?'uppercase':'none'};font-weight:700;">${b.props.text}</div>`
  },

  link: {
    label: 'Link',
    defaultW: 150, defaultH: 40,
    defaultProps: { text: 'Click here', href: '#', color: '' },
    render: (b) => `<div class="block-content"><span class="wc-link" style="color:${b.props.color||'var(--accent)'};">${b.props.text}</span></div>`
  },

  button: {
    label: 'Button',
    defaultW: 160, defaultH: 44,
    defaultProps: { text: 'Click Me', bg: '', color: '', radius: 8, fontSize: 14, variant: 'solid' },
    render: (b) => {
      const bg = b.props.bg || 'var(--accent)';
      const color = b.props.color || 'white';
      const r = b.props.radius;
      return `<div class="block-content" style="padding:0;"><div class="wc-btn" style="background:${bg};color:${color};border-radius:${r}px;font-size:${b.props.fontSize}px;">${b.props.text}</div></div>`;
    }
  },

  image: {
    label: 'Image',
    defaultW: 300, defaultH: 200,
    defaultProps: { src: '', alt: 'Image', objectFit: 'cover', radius: 10 },
    render: (b) => b.props.src
      ? `<div class="block-content" style="padding:0;border-radius:inherit;overflow:hidden;"><img src="${b.props.src}" alt="${b.props.alt}" style="width:100%;height:100%;object-fit:${b.props.objectFit};display:block;"/></div>`
      : `<div class="block-content"><div class="img-placeholder"><div class="ph-icon">🖼</div><span>Drop image URL in properties</span></div></div>`
  },

  video: {
    label: 'Video',
    defaultW: 400, defaultH: 240,
    defaultProps: { src: '', poster: '' },
    render: (b) => b.props.src
      ? `<div class="block-content" style="padding:0;"><video src="${b.props.src}" poster="${b.props.poster}" controls style="width:100%;height:100%;display:block;"></video></div>`
      : `<div class="block-content"><div class="video-placeholder"><div class="play-icon">▶</div><span>Add video URL in properties</span></div></div>`
  },

  icon: {
    label: 'Icon',
    defaultW: 56, defaultH: 56,
    defaultProps: { emoji: '⭐', size: 32 },
    render: (b) => `<div class="block-content" style="font-size:${b.props.size}px;">${b.props.emoji}</div>`
  },

  divider: {
    label: 'Divider',
    defaultW: 300, defaultH: 32,
    defaultProps: { color: '', thickness: 1, style: 'solid' },
    render: (b) => `<div class="block-content"><div class="wc-divider" style="height:${b.props.thickness}px;background:${b.props.color||'var(--border)'};border-style:${b.props.style};"></div></div>`
  },

  spacer: {
    label: 'Spacer',
    defaultW: 300, defaultH: 40,
    defaultProps: { size: 40 },
    render: (b) => `<div class="block-content" style="justify-content:center;color:var(--text-muted);font-size:10px;letter-spacing:0.1em;">SPACER</div>`
  },

  input: {
    label: 'Input',
    defaultW: 280, defaultH: 44,
    defaultProps: { placeholder: 'Enter text…', type: 'text', bg: '', radius: 8 },
    render: (b) => `<div class="block-content" style="padding:0;"><input class="wc-input" type="${b.props.type}" placeholder="${b.props.placeholder}" style="background:${b.props.bg||'var(--bg-input)'};border-radius:${b.props.radius}px;" readonly /></div>`
  },

  textarea: {
    label: 'Textarea',
    defaultW: 280, defaultH: 100,
    defaultProps: { placeholder: 'Enter message…', rows: 4, bg: '', radius: 8 },
    render: (b) => `<div class="block-content" style="padding:0;"><textarea class="wc-textarea" placeholder="${b.props.placeholder}" rows="${b.props.rows}" style="background:${b.props.bg||'var(--bg-input)'};border-radius:${b.props.radius}px;" readonly></textarea></div>`
  },

  checkbox: {
    label: 'Checkbox',
    defaultW: 180, defaultH: 40,
    defaultProps: { label: 'Check this', checked: true, color: '' },
    render: (b) => `<div class="block-content"><div class="wc-checkbox"><div class="checkbox-box" style="background:${b.props.color||'var(--accent)'};">${b.props.checked ? '✓' : ''}</div><span class="checkbox-label">${b.props.label}</span></div></div>`
  },

  toggle: {
    label: 'Toggle',
    defaultW: 180, defaultH: 40,
    defaultProps: { label: 'Enable feature', on: true, color: '' },
    render: (b) => `<div class="block-content"><div class="wc-toggle"><div class="toggle-track" style="background:${b.props.on?(b.props.color||'var(--accent)'):'var(--bg-hover)'}"><div class="toggle-thumb" style="transform:translateX(${b.props.on?'18px':'0'});"></div></div><span class="toggle-label">${b.props.label}</span></div></div>`
  },

  dropdown: {
    label: 'Dropdown',
    defaultW: 200, defaultH: 44,
    defaultProps: { placeholder: 'Select option…', options: 'Option 1\nOption 2\nOption 3', radius: 8 },
    render: (b) => `<div class="block-content" style="padding:0;"><div class="wc-dropdown" style="border-radius:${b.props.radius}px;"><span>${b.props.placeholder}</span><span class="wc-dropdown-arrow">▾</span></div></div>`
  },

  progress: {
    label: 'Progress',
    defaultW: 260, defaultH: 52,
    defaultProps: { label: 'Progress', value: 65, color: '' },
    render: (b) => `<div class="block-content"><div class="progress-label"><span>${b.props.label}</span><span>${b.props.value}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${b.props.value}%;${b.props.color?'background:'+b.props.color:''};"></div></div></div>`
  },

  badge: {
    label: 'Badge',
    defaultW: 90, defaultH: 30,
    defaultProps: { text: 'New', color: '', bg: '' },
    render: (b) => `<div class="block-content"><span class="wc-badge" style="color:${b.props.color||'var(--accent)'};background:${b.props.bg||'var(--accent-light)'};">${b.props.text}</span></div>`
  },

  avatar: {
    label: 'Avatar',
    defaultW: 56, defaultH: 56,
    defaultProps: { initials: 'JD', src: '', bg: '', size: 56 },
    render: (b) => b.props.src
      ? `<div class="block-content" style="padding:0;"><img src="${b.props.src}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"/></div>`
      : `<div class="block-content"><div class="wc-avatar" style="${b.props.bg?'background:'+b.props.bg:''}">${b.props.initials}</div></div>`
  },

  card: {
    label: 'Card',
    defaultW: 280, defaultH: 180,
    defaultProps: { title: 'Card Title', body: 'This is a card component with a description that explains the content.', showBtn: false, btnText: 'Learn More' },
    render: (b) => `<div class="block-content" style="flex-direction:column;align-items:flex-start;gap:10px;padding:20px;">
      <div class="card-title">${b.props.title}</div>
      <div class="card-body">${b.props.body}</div>
      ${b.props.showBtn ? `<div class="wc-btn" style="background:var(--accent);color:white;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;">${b.props.btnText}</div>` : ''}
    </div>`
  },

  navbar: {
    label: 'Navbar',
    defaultW: 800, defaultH: 60,
    defaultProps: { logo: 'Brand', links: 'Home\nAbout\nContact', showBtn: true, btnText: 'Get Started', bg: '', sticky: true },
    render: (b) => {
      const links = (b.props.links || '').split('\n').filter(Boolean)
        .map(l => `<a href="#">${l.trim()}</a>`).join('');
      return `<div class="block-content" style="justify-content:space-between;padding:0 24px;background:${b.props.bg||'var(--block-bg)'};">
        <div class="nav-logo" style="font-family:var(--font-display);font-weight:800;font-size:18px;">${b.props.logo}</div>
        <div class="nav-links" style="display:flex;gap:20px;">${links}</div>
        ${b.props.showBtn ? `<div class="wc-btn" style="background:var(--accent);color:white;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;width:auto;">${b.props.btnText}</div>` : ''}
      </div>`;
    }
  },

  breadcrumb: {
    label: 'Breadcrumb',
    defaultW: 280, defaultH: 36,
    defaultProps: { items: 'Home\nProducts\nDetail', separator: '/' },
    render: (b) => {
      const items = (b.props.items || 'Home\nPage').split('\n').filter(Boolean);
      const html = items.map((item, i) =>
        `<span class="crumb ${i === items.length-1 ? 'active' : ''}">${item.trim()}</span>${i < items.length-1 ? `<span class="crumb-sep">${b.props.separator}</span>` : ''}`
      ).join('');
      return `<div class="block-content"><div class="wc-breadcrumb">${html}</div></div>`;
    }
  },

  tabs: {
    label: 'Tabs',
    defaultW: 320, defaultH: 120,
    defaultProps: { tabs: 'Overview\nFeatures\nPricing', activeTab: 0, content: 'Tab content goes here.' },
    render: (b) => {
      const tabs = (b.props.tabs || 'Tab 1\nTab 2').split('\n').filter(Boolean);
      const tabHtml = tabs.map((t, i) =>
        `<div class="wc-tab ${i === b.props.activeTab ? 'active' : ''}">${t.trim()}</div>`
      ).join('');
      return `<div class="block-content" style="flex-direction:column;align-items:flex-start;padding:0;">
        <div class="wc-tabs-bar">${tabHtml}</div>
        <div class="wc-tabs-content">${b.props.content}</div>
      </div>`;
    }
  },

  pagination: {
    label: 'Pagination',
    defaultW: 240, defaultH: 44,
    defaultProps: { pages: 5, current: 2 },
    render: (b) => {
      let nums = '';
      for (let i = 1; i <= Math.min(b.props.pages, 7); i++) {
        nums += `<div class="page-num ${i === b.props.current ? 'active' : ''}">${i}</div>`;
      }
      return `<div class="block-content"><div class="wc-pagination"><div class="page-num nav">‹</div>${nums}<div class="page-num nav">›</div></div></div>`;
    }
  },

  hero: {
    label: 'Hero Section',
    defaultW: 800, defaultH: 400,
    defaultProps: {
      tag: '✦ New Launch',
      title: 'Build Something Beautiful',
      subtitle: 'A powerful platform to create websites without code. Drag, drop, and launch.',
      btnText: 'Get Started',
      btn2Text: 'Learn More',
      bg: ''
    },
    render: (b) => `<div class="block-content" style="flex-direction:column;gap:16px;padding:48px 40px;background:${b.props.bg||'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)'};align-items:center;">
      <div class="hero-tag">${b.props.tag}</div>
      <div class="hero-title">${b.props.title}</div>
      <div class="hero-sub">${b.props.subtitle}</div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <div class="hero-btn">${b.props.btnText}</div>
        <div style="background:rgba(255,255,255,0.15);color:white;padding:12px 28px;border-radius:99px;font-weight:600;font-size:14px;">${b.props.btn2Text}</div>
      </div>
    </div>`
  },

  features: {
    label: 'Features Grid',
    defaultW: 800, defaultH: 200,
    defaultProps: {
      items: '⚡ Fast Performance\nBuilt for speed with zero compromises.\n🎨 Beautiful Design\nStunning interfaces out of the box.\n🔒 Secure by Default\nEnterprise-grade security included.'
    },
    render: (b) => {
      const items = (b.props.items || '').split('\n').filter(Boolean);
      let html = '';
      for (let i = 0; i < items.length; i += 2) {
        if (items[i]) {
          const [emoji, ...titleParts] = items[i].split(' ');
          html += `<div class="feature-item">
            <div class="feature-icon">${emoji}</div>
            <div class="feature-title">${titleParts.join(' ')}</div>
            <div class="feature-desc">${items[i+1] || ''}</div>
          </div>`;
        }
      }
      return `<div class="block-content" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:28px;align-items:start;">${html}</div>`;
    }
  },

  testimonial: {
    label: 'Testimonial',
    defaultW: 320, defaultH: 180,
    defaultProps: {
      quote: '"This tool completely changed how I build websites. Absolutely incredible!"',
      name: 'Sarah Johnson',
      role: 'Product Designer',
      avatar: '👩'
    },
    render: (b) => `<div class="block-content" style="flex-direction:column;align-items:flex-start;gap:14px;padding:24px;">
      <div style="font-size:20px;color:var(--accent);">❝</div>
      <div class="testimonial-quote">${b.props.quote}</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${b.props.avatar}</div>
        <div>
          <div class="testimonial-name">${b.props.name}</div>
          <div class="testimonial-role">${b.props.role}</div>
        </div>
      </div>
    </div>`
  },

  pricing: {
    label: 'Pricing Card',
    defaultW: 260, defaultH: 320,
    defaultProps: {
      plan: 'Pro',
      price: '$29',
      period: '/month',
      features: 'Unlimited projects\nCustom domain\nExport code\nPriority support',
      btnText: 'Get Started',
      highlight: false
    },
    render: (b) => {
      const features = (b.props.features || '').split('\n').filter(Boolean)
        .map(f => `<div class="pricing-feature"><span class="pricing-check">✓</span>${f.trim()}</div>`).join('');
      return `<div class="block-content" style="flex-direction:column;align-items:flex-start;gap:14px;padding:28px;">
        <div class="pricing-badge">${b.props.plan}</div>
        <div class="pricing-price">${b.props.price}<span>${b.props.period}</span></div>
        <div class="pricing-features">${features}</div>
        <div class="wc-btn" style="background:var(--accent);color:white;padding:10px;border-radius:8px;font-size:13px;font-weight:600;width:100%;text-align:center;justify-content:center;">${b.props.btnText}</div>
      </div>`;
    }
  },

  cta: {
    label: 'CTA Section',
    defaultW: 700, defaultH: 200,
    defaultProps: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of creators building beautiful websites today.',
      btnText: 'Start for Free',
      btn2Text: 'Learn More'
    },
    render: (b) => `<div class="block-content" style="flex-direction:column;gap:12px;padding:40px;align-items:center;">
      <div class="cta-title">${b.props.title}</div>
      <div class="cta-sub">${b.props.subtitle}</div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <div class="cta-btn">${b.props.btnText}</div>
        <div style="color:var(--text-secondary);padding:12px 24px;font-size:14px;">${b.props.btn2Text} →</div>
      </div>
    </div>`
  },

  footer: {
    label: 'Footer',
    defaultW: 800, defaultH: 200,
    defaultProps: {
      brand: 'Webcraft',
      columns: 'Product\nFeatures\nPricing\nChangelog\n---\nCompany\nAbout\nBlog\nCareers\n---\nLegal\nPrivacy\nTerms',
      copyright: '© 2025 Webcraft. All rights reserved.'
    },
    render: (b) => {
      const cols = (b.props.columns || '').split('\n');
      let columnsHtml = '';
      let currentCol = null;
      cols.forEach(line => {
        if (!line.trim()) return;
        if (line === '---') { currentCol = null; return; }
        if (!currentCol) {
          if (columnsHtml !== '') columnsHtml += '</div>';
          columnsHtml += `<div class="footer-links"><div style="font-weight:700;font-size:12px;color:var(--text-primary);margin-bottom:8px;">${line.trim()}</div>`;
          currentCol = line;
        } else {
          columnsHtml += `<a href="#">${line.trim()}</a>`;
        }
      });
      if (currentCol) columnsHtml += '</div>';
      return `<div class="block-content" style="flex-direction:column;gap:20px;padding:32px;align-items:flex-start;">
        <div style="display:flex;gap:48px;flex-wrap:wrap;width:100%;">
          <div style="flex:1;min-width:150px;"><div class="footer-brand">${b.props.brand}</div></div>
          ${columnsHtml}
        </div>
        <div class="footer-copy" style="border-top:1px solid var(--border);padding-top:16px;width:100%;">${b.props.copyright}</div>
      </div>`;
    }
  },

  container: {
    label: 'Container',
    defaultW: 600, defaultH: 300,
    defaultProps: { bg: '', padding: 20, radius: 12, maxWidth: 1200, center: true },
    render: (b) => `<div class="container-label">CONTAINER</div><div class="block-content" style="align-items:flex-start;justify-content:flex-start;padding:${b.props.padding}px;"></div>`
  },

  section: {
    label: 'Section',
    defaultW: 800, defaultH: 400,
    defaultProps: { bg: '', padding: 40 },
    render: (b) => `<div class="container-label">SECTION</div><div class="block-content" style="align-items:flex-start;justify-content:flex-start;padding:${b.props.padding}px;background:${b.props.bg||''}"></div>`
  },

  row: {
    label: 'Row',
    defaultW: 600, defaultH: 100,
    defaultProps: { gap: 16, align: 'center', justify: 'flex-start', wrap: false },
    render: (b) => `<div class="container-label" style="color:var(--accent2);">ROW</div><div class="block-content" style="gap:${b.props.gap}px;align-items:${b.props.align};justify-content:${b.props.justify};flex-wrap:${b.props.wrap?'wrap':'nowrap'};padding:8px;"></div>`
  },

  column: {
    label: 'Column',
    defaultW: 200, defaultH: 300,
    defaultProps: { gap: 12, align: 'flex-start', justify: 'flex-start' },
    render: (b) => `<div class="container-label" style="color:var(--accent2);">COLUMN</div><div class="block-content" style="flex-direction:column;gap:${b.props.gap}px;align-items:${b.props.align};justify-content:${b.props.justify};padding:8px;"></div>`
  },

  grid: {
    label: 'Grid',
    defaultW: 600, defaultH: 300,
    defaultProps: { cols: 3, gap: 16 },
    render: (b) => `<div class="container-label" style="color:var(--warning);">GRID (${b.props.cols} cols)</div><div class="block-content" style="display:grid;grid-template-columns:repeat(${b.props.cols},1fr);gap:${b.props.gap}px;padding:12px;align-items:start;"></div>`
  },

  rect: {
    label: 'Rectangle',
    defaultW: 200, defaultH: 120,
    defaultProps: { bg: '', radius: 8, border: '', borderWidth: 0, opacity: 100 },
    render: (b) => `<div class="block-content" style="padding:0;"><div class="wc-rect" style="background:${b.props.bg||'var(--accent-light)'};border-radius:${b.props.radius}px;${b.props.border?`border:${b.props.borderWidth}px solid ${b.props.border};`:''}opacity:${b.props.opacity/100};"></div></div>`
  },

  circle: {
    label: 'Circle',
    defaultW: 100, defaultH: 100,
    defaultProps: { bg: '', border: '', borderWidth: 0, opacity: 100 },
    render: (b) => `<div class="block-content" style="padding:0;border-radius:50%;overflow:hidden;"><div class="wc-circle" style="background:${b.props.bg||'var(--accent-light)'};${b.props.border?`border:${b.props.borderWidth}px solid ${b.props.border};`:''}opacity:${b.props.opacity/100};"></div></div>`
  }
};
