import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.select("#project-linear-chart")
  .attr("width", 800)
  .attr("height", 500);

const margin = { top: 20, right: 150, bottom: 30, left: 50 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const data = await d3.csv("mouse_temp_long.csv", d => ({
  time: +d.time,
  mouse: d.mouse,
  temp: +d.temp
}));

const groups = d3.group(data, d => d.mouse);

const x = d3.scaleLinear()
  .domain(d3.extent(data, d => d.time))
  .range([0, width]);

const y = d3.scaleLinear()
  .domain(d3.extent(data, d => d.temp))
  .nice()
  .range([height, 0]);

const color = d3.scaleOrdinal(d3.schemeTableau10);

// 軸
g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));
g.append("g").call(d3.axisLeft(y));

// 線
const line = d3.line()
  .x(d => x(d.time))
  .y(d => y(d.temp));

for (const [mouse, values] of groups) {
  g.append("path")
    .datum(values)
    .attr("fill", "none")
    .attr("stroke", color(mouse))
    .attr("stroke-width", 1.5)
    .attr("d", line);
}

// 凡例をulに追加
const legend = d3.select(".legend");
for (const mouse of groups.keys()) {
  legend.append("li")
    .style("color", color(mouse))
    .text(mouse);
}
