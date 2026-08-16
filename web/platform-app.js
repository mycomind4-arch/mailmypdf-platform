const state = {
  vertical: 'Appeal Mail',
  active: 'Intelligence',
  activity: [
    { title: 'Document intelligence ready', detail: '12 documents indexed', time: '2m ago' },
    { title: 'Agent control plane online', detail: '8 tools available', time: '5m ago' },
    { title: 'Voice session service', detail: 'Ready for realtime sessions', time: '9m ago' }
  ]
};

const capabilities = {
  Intelligence: {
    eyebrow: 'INTELLIGENCE CORE',
    title: 'Understand the work before you act.',
    body: 'A unified intelligence layer for documents, evidence, workflows, reasoning, and agent actions.',
    cards: [
      ['Document Intelligence', 'Extract structure, entities, tables, dates, and provenance from complex documents.'],
      ['Reasoning & Retrieval', 'Ground decisions in evidence and the context of the active vertical.'],
      ['Agent Orchestration', 'Coordinate tools and workflows with scoped permissions and approval gates.']
    ]
  },
  Documents: {
    eyebrow: 'DOCUMENT INTELLIGENCE',
    title: 'Turn documents into structured knowledge.',
    body: 'Parse, classify, retrieve, and trace document facts without losing provenance.',
    cards: [['Ingestion', 'PDF, DOCX and structured document intake.'], ['Extraction', 'Layout-aware text, tables and entities.'], ['Provenance', 'Keep every important fact tied to its source.']]
  },
  Voice: {
    eyebrow: 'REALTIME VOICE',
    title: 'Talk to the Platform.',
    body: 'A provider-neutral voice layer for realtime sessions, tool calling, interruption handling, and approvals.',
    cards: [['Realtime Sessions', 'Low-latency voice session architecture.'], ['Tool Calling', 'Voice can invoke the same scoped Platform tools as text.'], ['Approval Gates', 'Consequential actions remain explicitly controlled.']]
  },
  Evidence: {
    eyebrow: 'EVIDENCE & PROOF',
    title: 'Make every important action defensible.',
    body: 'Preserve evidence, provenance, and decision context across the workflow.',
    cards: [['Evidence Graph', 'Connect documents, facts, events, and findings.'], ['Audit Trail', 'Track what happened and why.'], ['Proof', 'Build durable evidence packets from workflow activity.']]
  },
  Agents: {
    eyebrow: 'AGENT CONTROL PLANE',
    title: 'Give agents power without giving up control.',
    body: 'Scoped tools, repository intelligence, approvals, and auditable execution form the Platform agent layer.',
    cards: [['Tool Registry', 'One governed interface to Platform capabilities.'], ['GitHub Intelligence', 'Audit repositories, PRs, CI, and Platform drift.'], ['Human Approval', 'Keep high-impact actions behind explicit approval.']]
  },
  Integrations: {
    eyebrow: 'INTEGRATIONS',
    title: 'One Platform. Many systems.',
    body: 'Connect vertical applications and infrastructure through stable contracts instead of duplicated implementations.',
    cards: [['Verticals', 'Appeal Mail, Notice Respond, Immigration Mail and more.'], ['Infrastructure', 'Cloud services and specialized AI runtimes stay behind service boundaries.'], ['Providers', 'Swap document, voice, and AI providers without rewriting the Platform.']]
  }
};

function render() {
  const capability = capabilities[state.active];
  document.querySelector('#app').innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="#"><span class="brand-mark">M</span><span>MailMyPDF <b>Platform</b></span></a>
        <div class="vertical-label">ACTIVE VERTICAL</div>
        <button class="vertical-select" id="verticalSelect">${state.vertical}<span>⌄</span></button>
        <nav>${Object.keys(capabilities).map(name => `<button class="nav-item ${state.active === name ? 'active' : ''}" data-nav="${name}"><span>${icon(name)}</span>${name}</button>`).join('')}</nav>
        <div class="sidebar-bottom"><div class="system"><i></i><span>All systems operational</span></div><div class="user-chip"><span class="avatar">MC</span><div><strong>Platform Operator</strong><small>Control center</small></div></div></div>
      </aside>
      <main class="main">
        <header class="topbar"><div><span class="crumb">PLATFORM / ${state.active.toUpperCase()}</span><h1>${capability.title}</h1></div><button class="command" id="command">⌘ <span>Ask the Platform...</span><kbd>⌘ K</kbd></button></header>
        <section class="hero-panel"><div class="hero-copy"><span class="eyebrow">${capability.eyebrow}</span><p>${capability.body}</p><div class="hero-actions"><button class="primary" id="startAction">Open workspace <span>→</span></button><button class="secondary" id="voiceAction">◉ Talk to Platform</button></div></div><div class="orb"><div class="orb-core">M</div><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><span class="orb-dot d1"></span><span class="orb-dot d2"></span><span class="orb-dot d3"></span></div></section>
        <section class="cards">${capability.cards.map((card,i)=>`<article class="cap-card"><span class="card-index">0${i+1}</span><h2>${card[0]}</h2><p>${card[1]}</p><a href="#" class="learn">Explore capability →</a></article>`).join('')}</section>
        <section class="lower-grid"><article class="activity-panel"><div class="section-head"><div><span class="eyebrow">LIVE INTELLIGENCE</span><h2>Platform activity</h2></div><span class="live-dot">LIVE</span></div>${state.activity.map(a=>`<div class="activity"><span class="activity-dot"></span><div><strong>${a.title}</strong><p>${a.detail}</p></div><time>${a.time}</time></div>`).join('')}</article><article class="health-panel"><span class="eyebrow">PLATFORM HEALTH</span><h2>Ready for production workloads.</h2><div class="health-row"><span>AI orchestration</span><b>Operational</b></div><div class="health-row"><span>Document intelligence</span><b>Operational</b></div><div class="health-row"><span>Voice infrastructure</span><b>Ready</b></div><div class="health-row"><span>Agent control plane</span><b>Operational</b></div></article></section>
      </main>
    </div>
    <div class="toast" id="toast"></div>
  `;
  document.querySelectorAll('[data-nav]').forEach(btn => btn.onclick = () => { state.active = btn.dataset.nav; render(); });
  document.querySelector('#verticalSelect').onclick = () => toast('Vertical switching is connected to the Platform registry next.');
  document.querySelector('#command').onclick = () => toast('AI command surface ready for Platform agent wiring.');
  document.querySelector('#startAction').onclick = () => toast(`${state.active} workspace selected.`);
  document.querySelector('#voiceAction').onclick = () => toast('Realtime voice session requested.');
}
function icon(name) { return ({Intelligence:'✦',Documents:'▤',Voice:'◉',Evidence:'⌁',Agents:'◇',Integrations:'⊞'})[name]; }
function toast(message) { const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove('show'),2600); }
render();
