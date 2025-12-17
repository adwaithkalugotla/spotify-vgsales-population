async function draw() {
  const el = document.getElementById("chart");
  const tooltip = d3.select("#tooltip");

  d3.select("#chart").selectAll("svg").remove();

  const data = await d3.csv("/datasets/US States Ranked by Population 2024.csv", d3.autoType);
  if (!data?.length) return;

  const cols = data.columns;
  const stateCol = cols[0];      // first column = state name (usually)
  const keys = cols.slice(1);    // the stacked categories

  const { width, height } = el.getBoundingClientRect();
  const w = Math.max(340, width || 760);
  const h = Math.max(260, height || 420);

  const margin = { top: 16, right: 16, bottom: 85, left: 70 };
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .style("width", "100%")
    .style("height", "100%");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const stack = d3.stack().keys(keys)(data);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d[stateCol]))
    .range([0, innerW])
    .padding(0.12);

  const yMax = d3.max(stack, layer => d3.max(layer, d => d[1])) || 1;

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([innerH, 0])
    .nice();

  const color = d3.scaleOrdinal(d3.schemeTableau10).domain(keys);

  const fmtShort = d3.format(".2s"); // 80M, 2.3M, 500k
  const fmtComma = d3.format(",");

  // Bars
  g.selectAll("g.layer")
    .data(stack)
    .join("g")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d.map(v => ({ ...v, key: d.key })))
    .join("rect")
    .attr("x", d => xScale(d.data[stateCol]))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .on("mousemove", (event, d) => {
      const segmentValue = d[1] - d[0];
      const total = keys.reduce((sum, k) => sum + (+d.data[k] || 0), 0);

      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.data[stateCol]}</strong><br/>
           ${d.key}: ${fmtComma(segmentValue)}<br/>
           Total: ${fmtComma(total)}`
        );

      const [mx, my] = d3.pointer(event, document.body);
      tooltip.style("left", `${mx + 12}px`).style("top", `${my + 12}px`);
    })
    .on("mouseleave", () => tooltip.style("display", "none"));

  // X axis
  g.append("g")
    .attr("transform", `translate(0, ${innerH})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "10px");

  // Y axis with short formatting
  g.append("g")
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => fmtShort(d)))
    .selectAll("text")
    .style("font-size", "10px");

  // Y label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerH / 2)
    .attr("y", -52)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Population");
}

draw();
window.addEventListener("resize", draw);
