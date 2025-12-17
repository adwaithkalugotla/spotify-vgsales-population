document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dashboard");

  const charts = [
    { title: "Scatterplot",       url: "scatterplot/index.html" },
    { title: "Histogram",         url: "histogram/index.html" },
    { title: "Pie Chart",         url: "pie_chart/index.html" },
    { title: "Stacked Bar Chart", url: "stacked_bar_chart/index.html" }
  ];

  charts.forEach((chart) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    header.textContent = chart.title;

    const iframe = document.createElement("iframe");
    iframe.src = chart.url;
    iframe.title = chart.title;
    iframe.loading = "lazy";

    // Interaction / UX
    iframe.tabIndex = 0; // allows focus
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.setAttribute("scrolling", "no"); // charts should fit; no internal scrollbars

    card.append(header, iframe);
    container.appendChild(card);
  });
});
