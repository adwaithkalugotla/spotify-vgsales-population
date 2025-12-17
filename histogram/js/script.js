async function draw() {
  const el = document.getElementById("chart");
  const dataset = await d3.json("/datasets/spotify-2023.json");

  const dropdown = document.getElementById("metric");

  function getMetricLabel(metricKey) {
    const mapping = {
      "danceability_%": "Danceability (%)",
      "energy_%": "Energy (%)",
      "valence_%": "Valence (%)",
      bpm: "BPM",
    };
    return mapping[metricKey] || metricKey;
  }

  function render(metricKey) {
    const { width, height } = el.getBoundingClientRect();

    d3.select("#chart").selectAll("svg").remove();

    const w = Math.max(320, width || 600);
    const h = Math.max(240, height || 380);

    const margin = { top: 20, right: 20, bottom: 45, left: 55 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const valueAccessor = d => +d[metricKey];
    const clean = dataset.filter(d => Number.isFinite(valueAccessor(d)));

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(clean, valueAccessor) || 1])
      .range([0, innerW])
      .nice();

    const bins = d3.histogram()
      .value(valueAccessor)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(16))(clean);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 1])
      .range([innerH, 0])
      .nice();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .style("width", "100%")
      .style("height", "100%");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0, ${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));

    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 38)
      .attr("text-anchor", "middle")
      .attr("fill", "#111")
      .style("font-size", "12px")
      .text(getMetricLabel(metricKey));

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -42)
      .attr("text-anchor", "middle")
      .attr("fill", "#111")
      .style("font-size", "12px")
      .text("Frequency");

    g.selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => xScale(d.x0) + 1)
      .attr("y", d => yScale(d.length))
      .attr("width", d => Math.max(1, xScale(d.x1) - xScale(d.x0) - 2))
      .attr("height", d => innerH - yScale(d.length))
      .attr("fill", "steelblue");
  }

  dropdown.addEventListener("change", () => render(dropdown.value));

  render(dropdown.value);
}

draw();
window.addEventListener("resize", () => {
  const dropdown = document.getElementById("metric");
  if (dropdown) {
    // Re-render with current selection
    const metricKey = dropdown.value || "danceability_%";
    // call draw() to re-wire if needed
    draw();
  }
});
