async function draw() {
  const el = document.getElementById("chart");
  const { width, height } = el.getBoundingClientRect();

  d3.select("#chart").selectAll("svg").remove();

  const dataset = await d3.json("/datasets/spotify-2023.json");

  const margin = { top: 40, right: 20, bottom: 40, left: 50 };
  const w = Math.max(300, width || 600);
  const h = Math.max(250, height || 400);

  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  const xAccessor = d => +d["danceability_%"];
  const yAccessor = d => +d["energy_%"];

  const clean = dataset.filter(d => Number.isFinite(xAccessor(d)) && Number.isFinite(yAccessor(d)));

  const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .style("width", "100%")
    .style("height", "100%");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(clean, xAccessor))
    .range([0, innerW])
    .nice();

  const yScale = d3.scaleLinear()
    .domain(d3.extent(clean, yAccessor))
    .range([innerH, 0])
    .nice();

  g.append("g")
    .attr("transform", `translate(0, ${innerH})`)
    .call(d3.axisBottom(xScale).ticks(6));

  g.append("g")
    .call(d3.axisLeft(yScale).ticks(6));

  const tooltip = d3.select("#tooltip");

  const format0 = d3.format(".0f");

  g.selectAll("circle")
    .data(clean)
    .join("circle")
    .attr("cx", d => xScale(xAccessor(d)))
    .attr("cy", d => yScale(yAccessor(d)))
    .attr("r", 4)
    .attr("fill", "red")
    .on("mousemove", (event, d) => {
      tooltip.style("display", "block");

      tooltip.select(".metric-danceability span").text(format0(xAccessor(d)));
      tooltip.select(".metric-energy span").text(format0(yAccessor(d)));
      tooltip.select(".metric-track span").text(d.track_name || d.track || d.Track || "");

      const [mx, my] = d3.pointer(event, el);
      tooltip
        .style("left", `${Math.min(mx + 12, (w - 140))}px`)
        .style("top", `${Math.min(my + 12, (h - 70))}px`);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
    });
}

draw();
window.addEventListener("resize", draw);
