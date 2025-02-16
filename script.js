
const data = {
  nodes: [
    // LLMs and Chatbots
    { id: "ChatGPT", group: "LLM", description: "Conversational AI for education support and content generation", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    { id: "Claude", group: "LLM", description: "Advanced AI assistant for research and writing", gdpr: "Yes", ukHosted: "No", ipSecurity: "Enterprise" },
    
    // Learning Platforms
    { id: "Century", group: "Platform", description: "Adaptive learning platform using AI", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Advanced" },
    { id: "Third Space Learning", group: "Platform", description: "AI-powered math tutoring platform", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "High" },
    
    // Assessment Tools
    { id: "Gradescope", group: "Assessment", description: "AI-assisted grading and feedback", gdpr: "Yes", ukHosted: "No", ipSecurity: "High" },
    { id: "Turnitin", group: "Assessment", description: "AI-powered plagiarism detection", gdpr: "Yes", ukHosted: "Yes", ipSecurity: "Enterprise" }
  ],
  links: [
    { source: "ChatGPT", target: "Claude", value: 1 },
    { source: "Century", target: "Third Space Learning", value: 1 },
    { source: "Gradescope", target: "Turnitin", value: 1 }
  ]
};

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#graph-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2));

const links = svg.append("g")
  .selectAll("line")
  .data(data.links)
  .join("line")
  .style("stroke", "#999")
  .style("stroke-width", 2);

const nodes = svg.append("g")
  .selectAll("g")
  .data(data.nodes)
  .join("g");

nodes.append("circle")
  .attr("r", 30)
  .style("fill", d => d.group === "LLM" ? "#ff9999" : d.group === "Platform" ? "#99ff99" : "#9999ff");

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
  svg.attr("width", width).attr("height", height);
  simulation.force("center", d3.forceCenter(width / 2, height / 2));
  simulation.alpha(1).restart();
});
