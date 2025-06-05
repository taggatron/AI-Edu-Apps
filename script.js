const data = {
  nodes: [
    // LLMs and Chatbots
    { id: "DALL-E", group: "LLM", description: "AI image generation by OpenAI", 
      features: ["Image Generation", "Style Transfer", "Photo Editing", "Art Creation"],
      gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    { id: "Runway ML", group: "Platform", 
      features: ["Video Editing", "Motion Generation", "Image Synthesis", "Text-to-Video"],
      description: "AI-powered creative tools for video and image editing", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Canva", group: "Platform", 
      features: ["Design Templates", "AI Magic Edit", "Brand Kit", "Collaboration"],
      description: "Design platform with AI-powered features", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "ChatGPT", group: "LLM", 
      features: ["Text Generation", "Code Assistant", "Learning Support", "Content Creation"],
      description: "Conversational AI for education support and content generation", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    { id: "Claude", group: "LLM", 
      features: ["Research Assistant", "Long-form Writing", "Analysis", "Educational Support"],
      description: "Advanced AI assistant for research and writing", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    { id: "Anthropic", group: "Platform", 
      features: ["AI Safety", "Research Tools", "Model Training", "Ethics Framework"],
      description: "AI research company and creator of Claude", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    { id: "Midjourney", group: "Image", 
      features: ["Art Generation", "Style Customization", "Design Tools", "Creative Assistance"],
      description: "AI image generation focused on artistic quality", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "DeepSeek", group: "LLM", 
      features: ["Code Generation", "Technical Analysis", "Problem Solving", "Documentation"],
      description: "Advanced language model for coding and analysis", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "SUNO", group: "LLM", 
      features: ["Music Creation", "Audio Generation", "Composition", "Sound Design"],
      description: "AI music generation and composition", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Stable Diffusion", group: "Image", 
      features: ["Image Generation", "Model Training", "Custom Styles", "Batch Processing"],
      description: "AI image generation and editing", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Notion", group: "Platform", 
      features: ["Note Organization", "AI Writing", "Knowledge Base", "Team Collaboration"],
      description: "AI-enhanced workspace and note-taking platform", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Perplexity AI", group: "LLM", 
      features: ["Research Assistant", "Citation Support", "Real-time Search", "Fact Checking"],
      description: "AI-powered search and research assistant", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Speechify", group: "LLM", 
      features: ["Text-to-Speech", "Voice Customization", "Document Reading", "Multi-language Support"],
      description: "AI text-to-speech and document reader", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },

    // Learning Platforms
    { id: "Teachermatic", group: "Platform", 
      features: ["Lesson Planning", "Resource Creation", "Assessment Tools", "Progress Tracking"],
      description: "AI-powered teaching assistant and lesson planning tool", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "High" },
    { id: "Century", group: "Platform", 
      features: ["Personalized Learning", "Progress Analytics", "Content Creation", "Student Insights"],
      description: "Adaptive learning platform using AI", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Advanced" },
    { id: "Third Space Learning", group: "Platform", 
      features: ["Math Tutoring", "Progress Tracking", "Interactive Learning", "Real-time Support"],
      description: "AI-powered math tutoring platform", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "High" },

    // Assessment Tools
    { id: "Gradescope", group: "Assessment", 
      features: ["Auto Grading", "Feedback Generation", "Assignment Analytics", "Grade Management"],
      description: "AI-assisted grading and feedback", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Turnitin", group: "Assessment", 
      features: ["Plagiarism Detection", "Writing Feedback", "Similarity Checking", "Integration Tools"],
      description: "AI-powered plagiarism detection", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Enterprise" }
  ],
  links: [
    { source: "DALL-E", target: "Stable Diffusion", value: 0.9 },
    { source: "DALL-E", target: "Midjourney", value: 0.8 },
    { source: "Runway ML", target: "DALL-E", value: 0.7 },
    { source: "Runway ML", target: "Stable Diffusion", value: 0.8 },
    { source: "Canva", target: "DALL-E", value: 0.6 },
    { source: "Canva", target: "Stable Diffusion", value: 0.5 },
    { source: "ChatGPT", target: "Claude", value: 0.8 },
    { source: "Century", target: "Third Space Learning", value: 0.6 },
    { source: "Gradescope", target: "Turnitin", value: 0.9 },
    { source: "ChatGPT", target: "Century", value: 0.4 },
    { source: "Claude", target: "Turnitin", value: 0.5 },
    { source: "SUNO", target: "ChatGPT", value: 0.7 },
    { source: "Stable Diffusion", target: "SUNO", value: 0.6 },
    { source: "Anthropic", target: "Claude", value: 0.9 },
    { source: "Midjourney", target: "Stable Diffusion", value: 0.8 },
    { source: "DeepSeek", target: "ChatGPT", value: 0.7 },
    { source: "DeepSeek", target: "Claude", value: 0.6 },
    { source: "Teachermatic", target: "ChatGPT", value: 0.7 },
    { source: "Teachermatic", target: "Century", value: 0.5 },
    { source: "Notion", target: "ChatGPT", value: 0.8 },
    { source: "Perplexity AI", target: "ChatGPT", value: 0.9 },
    { source: "Perplexity AI", target: "Claude", value: 0.7 },
    { source: "Speechify", target: "ChatGPT", value: 0.6 },
    { source: "Notion", target: "Speechify", value: 0.5 }
  ]
};

const width = window.innerWidth;
const height = window.innerHeight;

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

// Add gradient definitions for 3D shading effect
const gradients = [
  { id: 'LLM', color: '#ff9999' },
  { id: 'Platform', color: '#99ff99' },
  { id: 'Image', color: '#2196F3' },
  { id: 'Assessment', color: '#9999ff' }
];

gradients.forEach(gradient => {
  const grad = defs.append("radialGradient")
    .attr("id", `gradient-${gradient.id}`)
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "50%")
    .attr("fy", "50%");

  grad.append("stop")
    .attr("offset", "0%")
    .attr("style", `stop-color:${gradient.color};stop-opacity:1`);

  grad.append("stop")
    .attr("offset", "100%")
    .attr("style", `stop-color:${d3.color(gradient.color).darker(1)};stop-opacity:1`);
});

// Calculate the optimal distance based on viewport size
const optimalDistance = Math.min(width, height) / 4;

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links)
    .id(d => d.id)
    .distance(d => optimalDistance * (2 - d.value))) // Stronger connections are closer
  .force("charge", d3.forceManyBody().strength(-optimalDistance * 2))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(d => 35)) // Updated collision radius
  .force("boundary", () => {
    const padding = 50;
    const radius = 35; // Match the node radius
    return function(alpha) {
      data.nodes.forEach(node => {
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
  .data(data.links)
  .join("line")
  .style("stroke", "#999")
  .style("stroke-width", d => d.value * 5) // Line thickness based on connection strength
  .style("stroke-opacity", d => d.value);

const nodes = svg.append("g")
  .selectAll("g")
  .data(data.nodes)
  .join("g");

// Function to randomly assign initial scale
function getRandomScale() {
  return Math.random() * 0.5 + 0.75; // Scale between 0.75 and 1.25
}

// Add scale to each node
data.nodes.forEach(node => {
  node.scale = getRandomScale();
  node.scaleDirection = 1; // 1 for increasing, -1 for decreasing
});

nodes.append("circle")
  .attr("r", 35) // Base node radius
  .style("fill", d => {
    const baseColor = d.group === "LLM" ? "#ff9999" : d.group === "Platform" ? "#99ff99" : d.group === "Image" ? "#2196F3" : "#9999ff";
    return `url(#gradient-${d.group})`;
  })
  .style("filter", "url(#drop-shadow)");

// Function to randomly assign certification status
function getRandomStatus() {
  const statuses = ['✓', '✗', '?'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Add status to each node
data.nodes.forEach(node => {
  node.certStatus = getRandomStatus();
});

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

  // Add image below text
  g.append("image")
    .attr("xlink:href", d => {
      const logos = {
        'DALL-E': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/openai.svg',
        'Runway ML': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/runkit.svg',
        'Canva': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/canva.svg',
        'ChatGPT': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/openai.svg',
        'Claude': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/anthropic.svg',
        'Anthropic': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/anthropic.svg',
        'Midjourney': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/midjourney.svg',
        'DeepSeek': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/openai.svg',
        'SUNO': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/soundcloud.svg',
        'Stable Diffusion': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/stability.svg',
        'Notion': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/notion.svg',
        'Perplexity AI': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/openai.svg',
        'Speechify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/soundcloud.svg',
        'Century': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/powershell.svg',
        'Third Space Learning': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/overleaf.svg',
        'Gradescope': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/gradle.svg',
        'Turnitin': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/checkmarx.svg',
        'Teachermatic': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/teachable.svg'
      }[d.id] || '';
    })
    .attr("x", -15)
    .attr("y", 5)
    .attr("width", 30)
    .attr("height", 30)
    .style("opacity", 0.8);
});

const tooltip = d3.select("#tooltip");

const infoPanel = d3.select("#info-panel");

nodes.on("click", (event, d) => {
  // Stop event propagation
  event.stopPropagation();
  
  // Get the color based on group
  const categoryColor = d.group === "LLM" ? "#ff9999" : 
                       d.group === "Platform" ? "#99ff99" : 
                       d.group === "Image" ? "#2196F3" : 
                       "#9999ff";
  
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
  const connections = data.links.filter(link => 
    link.source.id === d.id || link.target.id === d.id
  );
  const avgStrength = connections.reduce((acc, curr) => acc + curr.value, 0) / 
    Math.max(1, connections.length);
  
  infoPanel
    .select(".similarity-bar")
    .style("width", `${avgStrength * 100}%`);
});

// Close info panel when clicking outside
svg.on("click", () => {
  infoPanel.style("display", "none");
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
    .style("z-index", d => d.scale); // Adjust z-index based on scale
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
    .force("link", d3.forceLink(data.links)
      .id(d => d.id)
      .distance(d => optimalDistance * (2 - d.value)))
    .force("charge", d3.forceManyBody().strength(-optimalDistance * 2))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(35));
  simulation.alpha(1).restart();
});

// Control toggle functionality
const toggleControlsBtn = document.getElementById('toggleControls');
const controlsPanel = document.getElementById('controls');

toggleControlsBtn.addEventListener('click', () => {
  controlsPanel.style.display = controlsPanel.style.display === 'none' ? 'block' : 'none';
});

// Quadrant organization
const organizeQuadrentsBtn = document.getElementById('organizeQuadrants');

organizeQuadrentsBtn.addEventListener('click', () => {
  const centerX = width / 2;
  const centerY = height / 2;
  const padding = 100;
  const nodeRadius = 35;

  // Group nodes by their type
  const groupedNodes = {
    'LLM': data.nodes.filter(n => n.group === 'LLM'),
    'Platform': data.nodes.filter(n => n.group === 'Platform'),
    'Image': data.nodes.filter(n => n.group === 'Image'),
    'Assessment': data.nodes.filter(n => n.group === 'Assessment')
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
    data.nodes.forEach(node => {
      node.fx = null;
      node.fy = null;
    });
    simulation.alpha(1).restart();
  }, 3000);
});
