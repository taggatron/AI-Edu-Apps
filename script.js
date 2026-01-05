const width = window.innerWidth;
const height = window.innerHeight;

// --- Data source configuration ---
// GitHub Pages is static hosting, so there is no Node/Express backend.
// Locally (localhost), we keep using the backend on :3001.
const IS_LOCALHOST = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const IS_GITHUB_PAGES = window.location.hostname.endsWith('github.io');
const LOCAL_DEV_API_URL = "http://localhost:3001/api";
const SAME_ORIGIN_API_URL = new URL('/api', window.location.href).toString().replace(/\/$/, '');

// Use local dev backend on localhost; use same-origin backend on other hosts.
// On GitHub Pages, force static mode.
const API_URL = IS_LOCALHOST ? LOCAL_DEV_API_URL : (IS_GITHUB_PAGES ? null : SAME_ORIGIN_API_URL);
const STATIC_DATA_URL = new URL('backend/data.json', window.location.href).toString();

const NODES_OVERRIDE_STORAGE_KEY = 'aiEduApps.nodesOverride.v1';

// Expose a simple flag so inline scripts can react (e.g., disable Admin on Pages)
window.__APP_READ_ONLY__ = !API_URL;

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function loadNodesOverrideFromStorage() {
  try {
    const raw = window.localStorage.getItem(NODES_OVERRIDE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveNodesOverrideToStorage(nodes) {
  window.localStorage.setItem(NODES_OVERRIDE_STORAGE_KEY, JSON.stringify(nodes));
}

function escapeCsvValue(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows, headers) {
  const lines = [];
  lines.push(headers.map(escapeCsvValue).join(','));
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvValue(row[h])).join(','));
  }
  return lines.join('\n');
}

function parseCsv(text) {
  // Minimal RFC4180-ish CSV parser: handles quotes, commas, CRLF/LF.
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (c === '\n') {
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      continue;
    }
    if (c === '\r') {
      // ignore; handled by \n
      continue;
    }

    field += c;
  }

  // Flush last field
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

function downloadTextFile(filename, content, contentType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normalizeUploadedNode(raw) {
  const featuresRaw = raw.features ?? '';
  const features = String(featuresRaw)
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    id: (raw.id ?? '').trim(),
    group: (raw.group ?? '').trim(),
    description: raw.description ?? '',
    features,
    gdpr: raw.gdpr ?? '',
    ukHosted: raw.ukHosted ?? '',
    ipSecurity: raw.ipSecurity ?? '',
    certStatus: raw.certStatus ?? ''
  };
}

// Exposed helpers for the UI (index2.html)
window.exportAppsCsv = function exportAppsCsv() {
  const nodes = (window.data && Array.isArray(window.data.nodes)) ? window.data.nodes : [];
  const headers = ['id', 'group', 'description', 'features', 'gdpr', 'ukHosted', 'ipSecurity', 'certStatus'];
  const rows = nodes.map(n => ({
    id: n.id ?? '',
    group: n.group ?? '',
    description: n.description ?? '',
    features: Array.isArray(n.features) ? n.features.join('; ') : (n.features ?? ''),
    gdpr: n.gdpr ?? '',
    ukHosted: n.ukHosted ?? '',
    ipSecurity: n.ipSecurity ?? '',
    certStatus: n.certStatus ?? ''
  }));
  const csv = toCsv(rows, headers);
  downloadTextFile('ai-edu-apps.csv', csv, 'text/csv;charset=utf-8');
};

window.importAppsCsvFile = async function importAppsCsvFile(file) {
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headers = rows[0].map(h => h.trim());
  const headerSet = new Set(headers);
  if (!headerSet.has('id')) {
    throw new Error('CSV must include an "id" column.');
  }

  const parsed = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').trim();
    });
    const node = normalizeUploadedNode(obj);
    if (!node.id) continue;
    parsed.push(node);
  }

  if (parsed.length === 0) {
    throw new Error('No valid rows found (need at least one row with a non-empty id).');
  }

  saveNodesOverrideToStorage(parsed);
};

// --- Load data (backend if available, otherwise static JSON) ---
async function fetchData() {
  if (API_URL) {
    try {
      return await fetchJson(`${API_URL}/data`);
    } catch (e) {
      // If the backend isn't running locally, fall back to static JSON.
      console.warn('Backend unavailable; falling back to static data.json', e);
    }
  }
  return await fetchJson(STATIC_DATA_URL);
}

// --- Save node (only works when backend is available) ---
async function saveNodeToBackend(node) {
  if (!API_URL) {
    // On GitHub Pages (and other static hosts), we can't persist edits.
    throw new Error('Read-only mode: no backend available to persist changes.');
  }
  const res = await fetch(`${API_URL}/node/${encodeURIComponent(node.id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(node)
  });
  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
  }
}

// --- Main entry point ---
window.addEventListener('DOMContentLoaded', async function() {
  // Fetch data from backend
  const backendData = await fetchData();

  // If the user uploaded a CSV previously, prefer it (works on GitHub Pages)
  const nodesOverride = loadNodesOverrideFromStorage();
  if (nodesOverride) {
    backendData.nodes = nodesOverride;
  }

  // --- Data Normalization for Flexible Backend Format ---
  function normalizeNode(node) {
    // Map alternative field names to expected ones
    const id = node.id || node.name || node.title;
    const group = node.group || node.category || node.type;
    const description = node.description || node.desc || node.summary || '';
    let features = node.features || node.feature || [];
    if (typeof features === 'string') features = features.split(',').map(f => f.trim()).filter(f => f);
    const gdpr = node.gdpr || node.GDPR || node.gdprCompliant || '';
    const ukHosted = node.ukHosted || node.uk_hosted || node.hostedUK || '';
    const ipSecurity = node.ipSecurity || node.security || node.ip_security || '';
    const certStatus = node.certStatus || node.cert_status || node.certified || '';
    return {
      ...node,
      id,
      group,
      description,
      features,
      gdpr,
      ukHosted,
      ipSecurity,
      certStatus
    };
  }
  function normalizeLink(link) {
    // Accept links as {source: id or object, target: id or object, value}
    let source = link.source;
    let target = link.target;
    if (typeof source === 'object' && source !== null) source = source.id || source.name;
    if (typeof target === 'object' && target !== null) target = target.id || target.name;
    return {
      ...link,
      source,
      target,
      value: link.value || link.strength || 1
    };
  }
  // Defensive: handle possible nesting (e.g., backendData.data.nodes)
  let normalizedNodes = backendData.nodes || (backendData.data && backendData.data.nodes) || [];
  let normalizedLinks = backendData.links || (backendData.data && backendData.data.links) || [];
  normalizedNodes = normalizedNodes.map(normalizeNode);
  normalizedLinks = normalizedLinks.map(normalizeLink);
  // After normalization, convert link source/target from id to node object for D3
  const nodeById = Object.fromEntries(normalizedNodes.map(n => [n.id, n]));
  normalizedLinks = normalizedLinks.map(l => ({ ...l, source: nodeById[l.source] || l.source, target: nodeById[l.target] || l.target }));
  window.data = { nodes: normalizedNodes, links: normalizedLinks };

  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", (event) => {
      // Only close if clicking directly on SVG (not on nodes)
      if (event.target.tagName === 'svg') {
        tooltip.style("opacity", 0);
      }
    });

  // Add filter for 3D shading effect
  const defs = svg.append("defs");

  const filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

  filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");

  filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 2)
    .attr("dy", 2)
    .attr("result", "offsetBlur");

  const feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
    .attr("in", "offsetBlur");
  feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

  // --- Node and Grid View Gradient Definitions ---
  const groupGradientMap = {
    'LLM': 'url(#gradient-LLM)',
    'Platform': 'url(#gradient-Platform)',
    'Image': 'url(#gradient-Image)',
    'Assessment': 'url(#gradient-Assessment)'
  };

  // Add gradient definitions for 3D shading effect
  const gradients = [
    { id: 'LLM', color: '#ff9999' },
    { id: 'Platform', color: '#4ade80' }, // More saturated green for Platform
    { id: 'Image', color: '#2196F3' },
    { id: 'Assessment', color: '#9999ff' }
  ];

  gradients.forEach(gradient => {
    const grad = defs.append("radialGradient")
      .attr("id", `gradient-${gradient.id}`)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "40%")
      .attr("fy", "40%")
      .attr("gradientUnits", "objectBoundingBox");

    // Defensive: fallback to original color if d3.color returns null
    const baseColor = d3.color(gradient.color);
    const brighter = baseColor ? baseColor.brighter(1.5).formatHex() : gradient.color;
    const darker = baseColor ? baseColor.darker(1.2).formatHex() : gradient.color;

    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", brighter)
      .attr("stop-opacity", 0.85);
    grad.append("stop")
      .attr("offset", "60%")
      .attr("stop-color", gradient.color)
      .attr("stop-opacity", 0.7);
    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", darker)
      .attr("stop-opacity", 0.55);
  });

  // Calculate the optimal distance based on viewport size
  const optimalDistance = Math.min(width, height) / 4;

  const simulation = d3.forceSimulation(window.data.nodes)
    .force("link", d3.forceLink(window.data.links)
      .id(d => d.id)
      .distance(d => optimalDistance * (2 - d.value))) // Stronger connections are closer
    .force("charge", d3.forceManyBody().strength(-optimalDistance * 2))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(d => 35)) // Updated collision radius
    .force("boundary", () => {
      const padding = 50;
      const radius = 35; // Match the node radius
      return function(alpha) {
        window.data.nodes.forEach(node => {
          // Stronger boundary force and accounting for node radius
          if (node.x < padding + radius) {
            node.x = padding + radius;
            node.vx = Math.abs(node.vx); // Reverse velocity if hitting left boundary
          }
          if (node.x > width - (padding + radius)) {
            node.x = width - (padding + radius);
            node.vx = -Math.abs(node.vx); // Reverse velocity if hitting right boundary
          }
          if (node.y < padding + radius) {
            node.y = padding + radius;
            node.vy = Math.abs(node.vy); // Reverse velocity if hitting top boundary
          }
          if (node.y > height - (padding + radius)) {
            node.y = height - (padding + radius);
            node.vy = -Math.abs(node.vy); // Reverse velocity if hitting bottom boundary
          }
        });
      };
    });

  const links = svg.append("g")
    .selectAll("line")
    .data(window.data.links)
    .join("line")
    .style("stroke", "#999")
    .style("stroke-width", d => d.value * 5) // Line thickness based on connection strength
    .style("stroke-opacity", d => d.value);

  const nodes = svg.append("g")
    .selectAll("g")
    .data(window.data.nodes)
    .join("g");

  // Expose D3 selections for external UI (e.g., feature checkbox filter)
  window.nodes = nodes;
  window.links = links;

  // Function to randomly assign initial scale
  function getRandomScale() {
    return Math.random() * 0.5 + 0.75; // Scale between 0.75 and 1.25
  }

  // Add scale to each node
  window.data.nodes.forEach(node => {
    node.scale = getRandomScale();
    node.scaleDirection = 1; // 1 for increasing, -1 for decreasing
  });

  nodes.append("circle")
    .attr("r", 35) // Base node radius
    .style("fill", d => `url(#gradient-${d.group})`)
    .style("filter", "url(#drop-shadow)")
    .style("opacity", 0.85); // More glassy

  // Add glass highlight gradient definition
  const highlightGrad = defs.append("radialGradient")
    .attr("id", "glass-highlight-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "50%")
    .attr("fy", "50%")
    .attr("gradientUnits", "objectBoundingBox");

  highlightGrad.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#fff")
    .attr("stop-opacity", 0.7);
  highlightGrad.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", "#fff")
    .attr("stop-opacity", 0.15);
  highlightGrad.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#fff")
    .attr("stop-opacity", 0);

  // Add glass highlight ellipse to each node, with dynamic position
  const highlightEllipses = nodes.append("ellipse")
    .attr("rx", 13)
    .attr("ry", 7)
    .style("fill", "url(#glass-highlight-gradient)")
    .style("pointer-events", "none");

  // Add images and text to nodes
  nodes.each(function(d) {
    const g = d3.select(this);

    // Add text container below the node
    const textContainer = g.append("rect")
      .attr("class", "text-container")
      .attr("x", -50)
      .attr("y", 40)
      .attr("width", 100)
      .attr("height", 20)
      .attr("rx", 5)
      .attr("ry", 5);

    // Add text below the node
    const text = g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "55") // Position text below the node
      .style("font-size", "12px")
      .style("text-anchor", "middle") // Ensure text is centrally aligned
      .each(function() {
        const tspan = d3.select(this);
        tspan.append("tspan")
          .style("fill", "purple")
          .text("[");
        tspan.append("tspan")
          .text(d.id);
        tspan.append("tspan")
          .style("fill", "purple")
          .text("] ");
        tspan.append("tspan")
          .style("fill", d => d.certStatus === '✓' ? 'green' : 
                             d.certStatus === '✗' ? 'red' : 
                             'orange')
          .text(d => d.certStatus);
      });

    // Adjust text container size based on text width
    const bbox = text.node().getBBox();
    textContainer
      .attr("x", bbox.x - 5)
      .attr("y", bbox.y - 5)
      .attr("width", bbox.width + 10)
      .attr("height", bbox.height + 10);

    // Add image/logo inside the node
    const logoMap = {
      'Turnitin': 'logos/turnitin-logo.svg',
      'Midjourney': 'logos/midjourney.svg',
      'ChatGPT': 'logos/openai.svg',
      'DALL-E': 'logos/dalle-color.svg',
      'Claude': 'logos/claude-color.svg',
      'Anthropic': 'logos/anthropic.svg',
      'DeepSeek': 'logos/deepseek-color.svg',
      'SUNO': 'logos/suno.svg',
      'Stable Diffusion': 'logos/stability-color.svg',
      'Notion': 'logos/notion.svg',
      'Perplexity AI': 'logos/perplexity-color.svg',
      'Speechify': 'logos/speechify logo.svg',
      'Century': 'logos/century-tech-logo.png', // Use correct Century logo
      'Third Space Learning': 'logos/notebooklm.svg',
      'Gradescope': 'logos/githubcopilot.svg',
      'Teachermatic': 'logos/Teachermatic_logo.png',
      'Runway ML': 'logos/runway.svg',
      'Canva': 'logos/Canva App Logo.svg',
      'Github Co-Pilot': 'logos/githubcopilot.svg',
      'Microsoft Co-Pilot': 'logos/copilot-color.svg'
    };
    const logo = logoMap[d.id];
    if (logo) {
      g.append("image")
        .attr("xlink:href", logo)
        .attr("x", -28)
        .attr("y", -16)
        .attr("width", 56)
        .attr("height", 32)
        .style("opacity", 0.95);
    } else {
      g.append("image")
        .attr("xlink:href", '')
        .attr("x", -15)
        .attr("y", 5)
        .attr("width", 30)
        .attr("height", 30)
        .style("opacity", 0.8);
    }
  });

  const tooltip = d3.select("#tooltip");

  const infoPanel = d3.select("#info-panel");

  // --- Info Panel: Add Close Button and Animate ---
  // Add close button to info panel if not present
  if (!document.querySelector('.info-panel .close-btn')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Close info panel');
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      infoPanel.style('display', 'none');
    };
    const header = document.querySelector('.info-panel .info-header');
    if (header) header.appendChild(closeBtn);
    // Reduce margin-bottom of info-header
    header.style.marginBottom = '4px';
  }

  // Insert SDC certification status element if not present
  if (!document.querySelector('.info-panel .sdc-cert-status')) {
    const certDiv = document.createElement('div');
    certDiv.className = 'sdc-cert-status';
    certDiv.style.margin = '10px 0 0 0';
    certDiv.style.fontWeight = 'bold';
    certDiv.style.fontSize = '1.08rem';
    const header = document.querySelector('.info-panel .info-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(certDiv, header.nextSibling);
    }
  }

  // Animate info panel appearance
  function showInfoPanel() {
    infoPanel.style('display', 'block');
    infoPanel.node().style.animation = 'fadeInPanel 0.4s cubic-bezier(.4,0,.2,1)';
  }

  // Update info panel show logic
  nodes.on("click", (event, d) => {
    event.stopPropagation();

    // Get the color based on group
    const categoryColor = d.group === "LLM" ? "#ff9999" :
                         d.group === "Platform" ? "#99ff99" :
                         d.group === "Image" ? "#2196F3" :
                         "#9999ff";

    // --- Add logo to info panel title row ---
    const logoMap = {
      'Turnitin': 'logos/turnitin-logo.svg',
      'Midjourney': 'logos/midjourney.svg',
      'ChatGPT': 'logos/openai.svg',
      'DALL-E': 'logos/dalle-color.svg',
      'Claude': 'logos/claude-color.svg',
      'Anthropic': 'logos/anthropic.svg',
      'DeepSeek': 'logos/deepseek-color.svg',
      'SUNO': 'logos/suno.svg',
      'Stable Diffusion': 'logos/stability-color.svg',
      'Notion': 'logos/notion.svg',
      'Perplexity AI': 'logos/perplexity-color.svg',
      'Speechify': 'logos/speechify logo.svg',
      'Century': 'logos/century-tech-logo.png',
      'Third Space Learning': 'logos/notebooklm.svg',
      'Gradescope': 'logos/githubcopilot.svg',
      'Teachermatic': 'logos/Teachermatic_logo.png',
      'Runway ML': 'logos/runway.svg',
      'Canva': 'logos/Canva App Logo.svg',
      'Github Co-Pilot': 'logos/githubcopilot.svg',
      'Microsoft Co-Pilot': 'logos/copilot-color.svg'
    };
    const logo = logoMap[d.id];
    // Remove any previous logo
    d3.select('.info-panel .info-logo').remove();
    // Remove any previous web address
    d3.select('.info-panel .info-web').remove();
    // Insert logo at the start of the title row
    const header = d3.select('.info-panel .info-header');
    if (header.node() && logo) {
      header.insert('img', ':first-child')
        .attr('src', logo)
        .attr('alt', d.id + ' logo')
        .attr('class', 'info-logo')
        .style('height', '32px')
        .style('width', '32px')
        .style('marginRight', '12px')
        .style('verticalAlign', 'middle')
        .style('borderRadius', '6px')
        .style('background', '#fff');
    }

    // --- Make app title clickable to open web address ---
    const webMap = {
      'Turnitin': 'https://www.turnitin.com/',
      'Midjourney': 'https://www.midjourney.com/',
      'ChatGPT': 'https://chat.openai.com/',
      'DALL-E': 'https://openai.com/dall-e/',
      'Claude': 'https://claude.ai/',
      'Anthropic': 'https://www.anthropic.com/',
      'DeepSeek': 'https://deepseek.com/',
      'SUNO': 'https://suno.ai/',
      'Stable Diffusion': 'https://stability.ai/',
      'Notion': 'https://www.notion.so/',
      'Perplexity AI': 'https://www.perplexity.ai/',
      'Speechify': 'https://speechify.com/',
      'Century': 'https://www.century.tech/',
      'Third Space Learning': 'https://thirdspacelearning.com/',
      'Gradescope': 'https://www.gradescope.com/',
      'Teachermatic': 'https://teachermatic.com/',
      'Runway ML': 'https://runwayml.com/',
      'Canva': 'https://www.canva.com/',
      'Github Co-Pilot': 'https://github.com/features/copilot',
      'Microsoft Co-Pilot': 'https://copilot.microsoft.com/'
    };
    const appTitle = infoPanel.select(".app-title");
    appTitle.text(d.id)
      .style("cursor", webMap[d.id] ? "pointer" : "default")
      .style("color", "")
      .style("text-decoration", "")
      .on("click", function() {
        if (webMap[d.id]) {
          window.open(webMap[d.id], '_blank', 'noopener');
        }
      })
      .on("mouseover", function() {
        if (webMap[d.id]) {
          d3.select(this)
            .style("color", "#2563eb")
            .style("text-decoration", "underline");
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("color", "")
          .style("text-decoration", "");
      });

    // Remove any previous info-web (if present)
    d3.select('.info-panel .info-web').remove();

    // Update info panel content
    infoPanel
      .style("display", "block")
      .select(".app-title")
      .text(d.id);

    infoPanel
      .select(".app-category")
      .text(d.group)
      .style("background-color", categoryColor)
      .style("color", "white");  // Make text white for better contrast

    // --- SDC Certification Status ---
    const certDiv = document.querySelector('.info-panel .sdc-cert-status');
    if (certDiv) {
      // Remove animation classes if present
      certDiv.classList.remove('certified-animate', 'not-certified-animate');
      if (d.certStatus === '✓') {
        certDiv.innerHTML = '<span class="cert-bracket">[</span><span class="cert-check">✓</span><span class="cert-bracket">]</span> SDC certified';
        certDiv.className = 'sdc-cert-status certified';
        // Add animation class for 5 seconds
        setTimeout(() => certDiv.classList.remove('certified-animate'), 5000);
        certDiv.classList.add('certified-animate');
      } else if (d.certStatus === '✗') {
        certDiv.innerHTML = '<span class="cert-x">✗</span> SDC Not certified';
        certDiv.className = 'sdc-cert-status not-certified';
        setTimeout(() => certDiv.classList.remove('not-certified-animate'), 5000);
        certDiv.classList.add('not-certified-animate');
      } else {
        certDiv.innerHTML = '<span class="cert-unknown">?</span> SDC Certification Unknown';
        certDiv.className = 'sdc-cert-status unknown';
      }
    }

    infoPanel
      .select(".app-description")
      .text(d.description);

    // Update features
    const features = infoPanel.select(".features-container");
    features.html(""); // Clear existing content
    features
      .selectAll(".feature-badge")
      .data(d.features || [])
      .enter()
      .append("span")
      .attr("class", "feature-badge")
      .text(feature => feature);

    // Update security badges
    const security = infoPanel.select(".security-container");
    security.html(""); // Clear existing content
    security
      .selectAll(".security-badge")
      .data([
        `GDPR: ${d.gdpr}`,
        `UK Hosted: ${d.ukHosted}`,
        `Security: ${d.ipSecurity}`
      ])
      .enter()
      .append("span")
      .attr("class", "security-badge")
      .text(d => d);

    // Calculate and update similarity score based on connected nodes
    const connections = window.data.links.filter(link => 
      link.source.id === d.id || link.target.id === d.id
    );
    const avgStrength = connections.reduce((acc, curr) => acc + curr.value, 0) / 
      Math.max(1, connections.length);
    
    infoPanel
      .select(".similarity-bar")
      .style("width", '0%')
      .transition()
      .duration(500)
      .style("width", `${avgStrength * 100}%`);

    showInfoPanel();
  });

  // Close info panel when clicking outside
  svg.on("click", () => {
    infoPanel.style("display", "none");
  });

  // Accessibility: allow keyboard navigation for legend and controls
  const legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  // Add gentle continuous movement
  function jiggle() {
    return (Math.random() - 0.5) * 0.01; // Further reduced movement amplitude
  }

  simulation
    .alphaMin(0.001) // Prevent simulation from stopping completely
    .alphaDecay(0.02); // Slower decay for more continuous movement

  // Update the tick section in your simulation
  simulation.on("tick", () => {
    // Add small random movement to each node and contain within bounds
    simulation.nodes().forEach(node => {
      node.x += jiggle();
      node.y += jiggle();
      
      // More precise boundary containment
      const radius = 50;
      const padding = 50;
      node.x = Math.max(padding + radius, Math.min(width - (padding + radius), node.x));
      node.y = Math.max(padding + radius, Math.min(height - (padding + radius), node.y));

      // Rest of your existing scale logic
      node.scale += node.scaleDirection * 0.00005;
      if (node.scale >= 1.25) {
        node.scale = 1.25;
        node.scaleDirection = -1;
      } else if (node.scale <= 0.75) {
        node.scale = 0.75;
        node.scaleDirection = 1;
      }
    });

    links
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodes.attr("transform", d => `translate(${d.x},${d.y}) scale(${d.scale})`)
      .style("z-index", d => d.scale);

    // Dynamically move highlight to follow virtual light at top left
    const lightX = -width * 0.2; // Virtual light far outside top left
    const lightY = -height * 0.2;
    highlightEllipses
      .attr("cx", function(d) {
        // Vector from node to light
        const dx = lightX - d.x;
        const dy = lightY - d.y;
        // Normalize and scale highlight offset
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offset = 18; // How far from center
        return Math.cos(Math.atan2(dy, dx)) * offset;
      })
      .attr("cy", function(d) {
        const dx = lightX - d.x;
        const dy = lightY - d.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offset = 18;
        return Math.sin(Math.atan2(dy, dx)) * offset;
      });
  });

  // Keep simulation running
  d3.interval(() => {
    simulation.alpha(0.1);
    simulation.restart();
  }, 100);

  // Make the graph responsive
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const optimalDistance = Math.min(width, height) / 4;

    svg.attr("width", width).attr("height", height);
    simulation
      .force("link", d3.forceLink(window.data.links)
        .id(d => d.id)
        .distance(d => optimalDistance * (2 - d.value)))
      .force("charge", d3.forceManyBody().strength(-optimalDistance * 2))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));
    simulation.alpha(1).restart();
  });

  // Control toggle functionality is handled by index2.html to avoid duplicate listeners.

  // Quadrant organization
  const organizeQuadrentsBtn = document.getElementById('organizeQuadrants');

  organizeQuadrentsBtn.addEventListener('click', () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 100;
    const nodeRadius = 35;

    // Group nodes by their type
    const groupedNodes = {
      'LLM': window.data.nodes.filter(n => n.group === 'LLM'),
      'Platform': window.data.nodes.filter(n => n.group === 'Platform'),
      'Image': window.data.nodes.filter(n => n.group === 'Image'),
      'Assessment': window.data.nodes.filter(n => n.group === 'Assessment')
    };

    // Randomize positions within quadrants
    Object.entries(groupedNodes).forEach(([group, nodes]) => {
      nodes.forEach(node => {
        switch(group) {
          case 'LLM':
            node.fx = padding + Math.random() * (centerX - padding * 2);
            node.fy = padding + Math.random() * (centerY - padding * 2);
            break;
          case 'Platform':
            node.fx = centerX + Math.random() * (centerX - padding * 2);
            node.fy = padding + Math.random() * (centerY - padding * 2);
            break;
          case 'Image':
            node.fx = padding + Math.random() * (centerX - padding * 2);
            node.fy = centerY + Math.random() * (centerY - padding * 2);
            break;
          case 'Assessment':
            node.fx = centerX + Math.random() * (centerX - padding * 2);
            node.fy = centerY + Math.random() * (centerY - padding * 2);
            break;
        }
      });
    });

    simulation.alpha(1).restart();

    // Release nodes after 3 seconds
    setTimeout(() => {
      window.data.nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      simulation.alpha(1).restart();
    }, 3000);
  });

  // Remove the floating key/legend from the main canvas (graph-container)
  // and move its creation and functionality to the bottom of the screen, all items in a single row
  // --- Key/Legend at Bottom ---
  const bottomKey = document.createElement('div');
  bottomKey.id = 'bottom-key';
  bottomKey.innerHTML = `
    <div class="canvas-key-row" data-group="LLM"><div class="key-swatch node-bg-LLM"></div> LLM</div>
    <div class="canvas-key-row" data-group="Platform"><div class="key-swatch node-bg-Platform"></div> Platform</div>
    <div class="canvas-key-row" data-group="Image"><div class="key-swatch node-bg-Image"></div> Image Creation</div>
    <div class="canvas-key-row" data-group="Assessment"><div class="key-swatch node-bg-Assessment"></div> Assessment</div>
    <div class="canvas-key-row" data-cert="✓"><span style="color:purple;font-weight:bold;">[</span><span style="display:inline-block;width:18px;text-align:center;color:green;font-weight:bold;">✓</span><span style="color:purple;font-weight:bold;">]</span> Certified</div>
    <div class="canvas-key-row" data-cert="✗"><span style="display:inline-block;width:18px;text-align:center;color:red;font-weight:bold;">✗</span> Not Certified</div>
    <div class="canvas-key-row" data-cert="?"><span style="display:inline-block;width:18px;text-align:center;color:orange;font-weight:bold;">?</span> Unknown</div>
  `;
  bottomKey.style.position = 'fixed';
  bottomKey.style.left = '50%';
  bottomKey.style.bottom = '0';
  bottomKey.style.transform = 'translateX(-50%)';
  bottomKey.style.background = 'rgba(255,255,255,0.97)';
  bottomKey.style.borderRadius = '12px 12px 0 0';
  bottomKey.style.boxShadow = '0 -2px 16px rgba(60,60,100,0.10)';
  bottomKey.style.padding = '10px 24px 8px 24px';
  bottomKey.style.zIndex = 200;
  bottomKey.style.fontSize = '1rem';
  bottomKey.style.minWidth = '120px';
  bottomKey.style.pointerEvents = 'auto';
  bottomKey.style.userSelect = 'none';
  bottomKey.style.transition = 'box-shadow 0.2s';
  bottomKey.style.border = '1.5px solid #e0e7ff';
  bottomKey.style.backdropFilter = 'blur(4px)';
  bottomKey.style.display = 'flex';
  bottomKey.style.flexDirection = 'row';
  bottomKey.style.alignItems = 'center';
  bottomKey.style.gap = '18px';
  document.body.appendChild(bottomKey);

  // Add key rows styling (reuse existing style block if needed)
  const style = document.createElement('style');
  style.innerHTML = `
    #bottom-key .canvas-key-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0;
      font-size: 1rem;
      cursor: pointer;
      user-select: none;
      border-radius: 6px;
      transition: background 0.2s;
      padding: 4px 10px;
      min-width: 120px;
      justify-content: center;
    }
    #bottom-key .canvas-key-row.active {
      background: #e0e7ff;
    }
    #bottom-key .key-swatch {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 4px;
    }
    #bottom-key .node-bg-LLM { background: linear-gradient(135deg, #ffb3b3 0%, #ff9999 100%); }
    #bottom-key .node-bg-Platform { background: linear-gradient(135deg, #aaffb3 0%, #d6ffe0 100%); }
    #bottom-key .node-bg-Image { background: linear-gradient(135deg, #7faaff 0%, #b3c6ff 100%); }
    #bottom-key .node-bg-Assessment { background: linear-gradient(135deg, #b3b3ff 0%, #e0e0ff 100%); }
    #bottom-key > div:nth-child(3) > div {
      min-width: 16px;
      width: 16px;
      max-width: 16px;
    }
    #bottom-key > div:nth-child(4) > div {
      min-width: 16px;
      width: 16px;
      max-width: 16px;
    }
      
  `;
  document.head.appendChild(style);

  // --- Key Filtering Functionality (moved from floating legend) ---
  let activeKeyGroup = null;
  let activeCertStatus = null;
  bottomKey.querySelectorAll('.canvas-key-row[data-group]').forEach(row => {
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const group = this.getAttribute('data-group');
      if (activeKeyGroup === group) {
        // Reset filter
        nodes.style('display', '');
        links.style('display', '');
        bottomKey.querySelectorAll('.canvas-key-row').forEach(r => r.classList.remove('active'));
        activeKeyGroup = null;
      } else {
        // Filter nodes/links
        nodes.each(function(d) {
          d3.select(this).style('display', d.group === group ? '' : 'none');
        });
        links.style('display', function(d) {
          return (d.source.group === group && d.target.group === group) ? '' : 'none';
        });
        bottomKey.querySelectorAll('.canvas-key-row').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        activeKeyGroup = group;
        activeCertStatus = null;
      }
    });
  });
  bottomKey.querySelectorAll('.canvas-key-row[data-cert]').forEach(row => {
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const cert = this.getAttribute('data-cert');
      if (activeCertStatus === cert) {
        // Reset filter
        nodes.style('display', '');
        links.style('display', '');
        bottomKey.querySelectorAll('.canvas-key-row').forEach(r => r.classList.remove('active'));
        activeCertStatus = null;
      } else {
        // Filter nodes/links by cert status
        nodes.each(function(d) {
          d3.select(this).style('display', d.certStatus === cert ? '' : 'none');
        });
        links.style('display', function(d) {
          return (d.source.certStatus === cert && d.target.certStatus === cert) ? '' : 'none';
        });
        bottomKey.querySelectorAll('.canvas-key-row').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        activeCertStatus = cert;
        activeKeyGroup = null;
      }
    });
  });
  window.addEventListener('click', function(e) {
    if (!bottomKey.contains(e.target)) {
      if (activeKeyGroup || activeCertStatus) {
        nodes.style('display', '');
        links.style('display', '');
        bottomKey.querySelectorAll('.canvas-key-row').forEach(r => r.classList.remove('active'));
        activeKeyGroup = null;
        activeCertStatus = null;
      }
    }
  });

  // Feature search UI is handled by index2.html (#controls checkbox UI)

  // Update links referencing Co-Pilot
  const updatedLinks = [];
  window.data.links.forEach(link => {
    let source = link.source;
    let target = link.target;
    if (source === 'Co-Pilot') source = 'Github Co-Pilot';
    if (target === 'Co-Pilot') target = 'Github Co-Pilot';
    updatedLinks.push({ ...link, source, target });
  });
  window.data.links = updatedLinks;

  // Node/Grid view has been removed; the app runs in a single graph view.

  // Add CSS for node backgrounds (only once)
  if (!document.getElementById('node-bg-styles')) {
    const style = document.createElement('style');
    style.id = 'node-bg-styles';
    style.innerHTML = `
      .node-bg-LLM {
        background: radial-gradient(circle at 40% 40%, #ffb3b3 0%, #ff9999 60%, #d46a6a 100%);
      }
      .node-bg-Platform {
        background: radial-gradient(circle at 40% 40%, #7fffd4 0%, #4ade80 60%, #1eae60 100%);
      }
      .node-bg-Image {
        background: radial-gradient(circle at 40% 40%, #6ec6ff 0%, #2196F3 60%, #0b3c6e 100%);
      }
      .node-bg-Assessment {
        background: radial-gradient(circle at 40% 40%, #b3b3ff 0%, #9999ff 60%, #5a5ad1 100%);
      }
      .app-card {
        background-clip: padding-box;
        border-radius: 18px;
      }
    `;
    document.head.appendChild(style);
  }

  // Add key swatch CSS if not present
  if (!document.getElementById('key-swatch-styles')) {
    const style = document.createElement('style');
    style.id = 'key-swatch-styles';
    style.innerHTML = `
      .key-swatch {
        width: 22px;
        height: 22px;
        border-radius: 8px;
        display: inline-block;
        margin-right: 7px;
        vertical-align: middle;
        box-shadow: 0 1px 4px rgba(60,60,100,0.10);
        border: 1.5px solid #e0e7ff;
      }
    `;
    document.head.appendChild(style);
  }
});
