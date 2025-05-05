import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg1 = d3.select("#line-chart")
  .attr("width", 800)
  .attr("height", 500);

const margin = { top: 20, right: 150, bottom: 30, left: 50 },
      width = +svg1.attr("width") - margin.left - margin.right,
      height = +svg1.attr("height") - margin.top - margin.bottom;

const g = svg1.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const data = await d3.csv("Mouse_Data_Long.csv", d => ({
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


g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));
g.append("g").call(d3.axisLeft(y));


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

const legend = d3.select(".legend");
for (const mouse of groups.keys()) {
  legend.append("li")
    .style("color", color(mouse))
    .text(mouse);
}

const blockWidth = 720;
const maxTime = d3.max(data, d => d.time);


for (let start = 0; start < maxTime; start += blockWidth) {
  const end = start + blockWidth;
  
  const blockIndex = Math.floor(start / blockWidth);
  if (blockIndex % 2 === 0) {
    g.append("rect")
      .attr("x", x(start))
      .attr("y", 0)
      .attr("width", x(end) - x(start))
      .attr("height", height)
      .attr("fill", "rgba(0, 0, 0, 0.15)");
  }
}

