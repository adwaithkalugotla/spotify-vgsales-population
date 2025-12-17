async function draw() {
  const el = document.getElementById("chart");
  const tooltip = d3.select("#tooltip");

  // Clear old render
  d3.select("#chart").selectAll("*").remove();

  const rawData = await d3.csv("/datasets/vgsales.csv", d3.autoType);

  // Aggregate: total Global_Sales per Genre
  const data = d3.rollups(
    rawData,
    v => d3.sum(v, d => d.Global_Sales),
    d => d.Genre
  )
    .map(([genre, sales]) => ({ genre, sales }))
    .filter(d => Number.isFinite(d.sales) && d.sales > 0)
    .sort((a, b) => b.sales - a.sales);

  const { width, height } = el.getBoundingClientRect();
  const w = Math.max(320, width || 520);
  const h = Math.max(240, height || 420);

  // Leave room on the right for a legend
  const legendW = Math.min(220, Math.floor(w * 0.35));
  const pieW = w - legendW;

  const size = Math.min(pieW, h);
  const radius = size / 2 - 10;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .style("width", "100%")
    .style("height", "100%");

  const g = svg.append("g")
    .attr("transform", `translate(${pieW / 2}, ${h / 2})`);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.genre))
    .range(d3.schemeTableau10);

  const pie = d3.pie()
    .sort(null)
    .value(d => d.sales);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const total = d3.sum(data, d => d.sales);
  const fmtSales = d3.format(",.2f");
  const fmtPct = d3.format(".1%");

  g.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.genre))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .on("mousemove", (event, d) => {
      const pct = total ? (d.data.sales / total) : 0;

      tooltip
        .style("display", "block")
        .html(
          `<strong>${d.data.genre}</strong><br/>
           Sales: ${fmtSales(d.data.sales)}M<br/>
           Share: ${fmtPct(pct)}`
        );

      const [mx, my] = d3.pointer(event, document.body);
      tooltip
        .style("left", `${mx + 12}px`)
        .style("top", `${my + 12}px`);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
    });

  // Legend (top 8, rest grouped as "Other" if needed — but here we show all, scroll-free)
  const legend = svg.append("g")
    .attr("transform", `translate(${pieW + 10}, 16)`);

  const legendItems = data.slice(0, 10); // keep it compact (top 10 genres)

  legend.selectAll("g")
    .data(legendItems)
    .join("g")
    .attr("transform", (_, i) => `translate(0, ${i * 18})`)
    .each(function(d) {
      const row = d3.select(this);
      row.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(d.genre));

      row.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("font-size", "12px")
        .text(d.genre);
    });
}

draw();
window.addEventListener("resize", draw);