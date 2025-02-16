
// Define logo URLs using direct image links
const logoUrls = {
  "ChatGPT": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "Claude": "https://www.anthropic.com/images/logo.svg",
  "Century": "https://century.tech/wp-content/uploads/2021/06/Century-Logo.png",
  "Third Space Learning": "https://www.thirdspacelearning.com/wp-content/uploads/2021/01/TSL-Logo.png",
  "Gradescope": "https://www.gradescope.com/assets/gradescope-logo-b4b7119579478ca0578657f84e1a61f6e3916ff821a8267f265a087a5ff4c2f4.svg",
  "Turnitin": "https://www.turnitin.com/img/logo/turnitin-logo.svg"
};

const data = {
  nodes: [
    // LLMs and Chatbots
    { id: "ChatGPT", group: "LLM", description: "Conversational AI for education support and content generation", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise", x: Math.random() * width, y: Math.random() * height },
    { id: "Claude", group: "LLM", description: "Advanced AI assistant for research and writing", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    
    // Learning Platforms
    { id: "Century", group: "Platform", description: "Adaptive learning platform using AI", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Advanced" },
    { id: "Third Space Learning", group: "Platform", description: "AI-powered math tutoring platform", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "High" },
    
    // Assessment Tools
    { id: "Gradescope", group: "Assessment", description: "AI-assisted grading and feedback", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Turnitin", group: "Assessment", description: "AI-powered plagiarism detection", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Enterprise" }
  ],
  links: [
    { source: "ChatGPT", target: "Claude", value: 0.8 },
    { source: "Century", target: "Third Space Learning", value: 0.6 },
    { source: "Gradescope", target: "Turnitin", value: 0.9 },
    { source: "ChatGPT", target: "Century", value: 0.4 },
    { source: "Claude", target: "Turnitin", value: 0.5 }
  ]
};

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#graph-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Calculate the optimal distance based on viewport size
const optimalDistance = Math.min(width, height) / 4;

// Initialize nodes at random positions
data.nodes.forEach(node => {
  node.x = Math.random() * width;
  node.y = Math.random() * height;
});

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links)
    .id(d => d.id)
    .distance(d => optimalDistance * (2 - d.value))) // Stronger connections are closer
  .force("charge", d3.forceManyBody().strength(-optimalDistance * 2))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(40));

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

// Create node container
const nodeGroups = nodes.append("g")
  .attr("class", "node")
  .style("opacity", 0) // Start invisible for animation
  .transition()
  .duration(1500)
  .style("opacity", 1); // Fade in

// Add circular background
nodeGroups.append("circle")
  .attr("r", 30)
  .style("fill", d => d.group === "LLM" ? "#ff9999" : d.group === "Platform" ? "#99ff99" : "#9999ff");

// Add logo images
nodeGroups.append("image")
  .attr("xlink:href", d => logoUrls[d.id])
  .attr("x", -25)
  .attr("y", -25)
  .attr("width", 50)
  .attr("height", 50)
  .attr("clip-path", "circle(25px at center)");

// Add text label
nodes.append("text")
  .text(d => d.id)
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .style("font-size", "12px");

const tooltip = d3.select("#tooltip");

nodes.on("mouseover", (event, d) => {
  tooltip.style("opacity", 1)
    .html(`
      <h3>${d.id}</h3>
      <p>${d.description}</p>
      <table>
        <tr>
          <th>Feature</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>GDPR Compliant</td>
          <td>${d.gdpr}</td>
        </tr>
        <tr>
          <td>UK Hosted</td>
          <td>${d.ukHosted}</td>
        </tr>
        <tr>
          <td>IP Security</td>
          <td>${d.ipSecurity}</td>
        </tr>
      </table>
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
})
.on("mouseout", () => {
  tooltip.style("opacity", 0);
});

simulation.on("tick", () => {
  links
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  nodes.attr("transform", d => `translate(${d.x},${d.y})`);
});

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
    .force("collision", d3.forceCollide().radius(40));
  simulation.alpha(1).restart();
});
