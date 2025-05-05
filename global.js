import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg1 = d3.select("#line-chart")
  .attr("width", 800)
  .attr("height", 550);

const margin = { top: 20, right: 150, bottom: 30, left: 70 },
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



svg1.append("text")
  .attr("x", margin.left / 4)
  .attr("y", height / 2 + margin.top)
  .attr("transform", `rotate(-90, ${margin.left / 2}, ${height / 2 + margin.top})`)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Body Temperature (°C)");

// X軸ラベル

svg1.attr("height", 600);  
svg1.append("text")
  .attr("x", width / 2 + margin.left)
  .attr("y", height + margin.top + margin.bottom + 20)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Time (minutes)");



const svg2 = d3.select("#bar-chart")
  .attr("width", 800)
  .attr("height", 500);

const margin2 = { top: 40, right: 20, bottom: 60, left: 50 },
      width2 = 800 - margin2.left - margin2.right,
      height2 = 500 - margin2.top - margin2.bottom;

const g2 = svg2.append("g")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

const data2 = await d3.csv("Mouse_Data_Long2.csv", d => ({
    time: +d.time,
    mouse: d.mouse,
    temp: +d.temp
  }));

const x0 = d3.scaleBand()
  .domain(d3.group(data2, d => d.time).keys())  // ← .keys() を忘れずに！
  .range([0, width2])
  .paddingInner(0.1);

const mouseNames = Array.from(d3.group(data2, d => d.mouse).keys());

const x1 = d3.scaleBand()
  .domain(mouseNames)
  .range([0, x0.bandwidth()])
  .padding(0.05);

const y2 = d3.scaleLinear()
  .domain([35, d3.max(data2, d => d.temp)])
  .nice()
  .range([height2, 0]);

const color2 = d3.scaleOrdinal(d3.schemeTableau10);

// 軸
g2.append("g")
  .attr("transform", `translate(0,${height2})`)
  .call(d3.axisBottom(x0).tickFormat(d => d + " min"));
g2.append("g").call(d3.axisLeft(y2));

// 棒グラフ本体
const barGroups = g2.selectAll("g.bar-group")
  .data2(d3.groups(data2, d => d.time))
  .join("g")
  .attr("class", "bar-group")
  .attr("transform", d => `translate(${x0(d[0])},0)`);

barGroups.selectAll("rect")
  .data2(d => d[1]) // 各 time に属する mouse-temp データ
  .join("rect")
  .attr("x", d => x1(d.mouse))
  .attr("y", d => y2(d.temp))
  .attr("width", x1.bandwidth())
  .attr("height", d => height2 - y2(d.temp))
  .attr("fill", d => color2(d.mouse));
