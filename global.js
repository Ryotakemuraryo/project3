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
  .attr("height", 550);

const margin2 = { top: 20, right: 150, bottom: 30, left: 70 },
      width2 = 800 - margin2.left - margin2.right,
      height2 = 500 - margin2.top - margin2.bottom;

const g2 = svg2.append("g")
  .attr("transform", `translate(${margin2.left},${margin2.top})`);

const data2 = await d3.csv("Mouse_Data_Long2.csv", d => ({
  time: +d.time,
  temp: +d.temp  // f1 のみ
}));

// x軸（時間）
const xbar = d3.scaleBand()
  .domain(data2.map(d => d.time))
  .range([0, width2])
  .padding(0.2);

// y軸（体温）
const ybar = d3.scaleLinear()
  .domain([35, d3.max(data2, d => d.temp)])
  .nice()
  .range([height2, 0]);


const daytimeData = data2.filter((_, i) => i % 2 === 1); // 黄色 = 奇数index
const nightData = data2.filter((_, i) => i % 2 === 0);   // 黒 = 偶数index
const avgDay = d3.mean(daytimeData, d => d.temp);
const avgNight = d3.mean(nightData, d => d.temp);



// 軸
g2.append("g")
  .attr("class", "x-axis") 
  .attr("transform", `translate(0,${height2})`)
  .call(d3.axisBottom(xbar).tickFormat(d => d + " min"));

g2.selectAll("g.x-axis text")
  .attr("transform", "rotate(-45)")
  .style("text-anchor", "end");

g2.append("g").call(d3.axisLeft(ybar));


// 棒
g2.selectAll("rect")
  .data(data2)
  .join("rect")
  .attr("x", d => xbar(d.time))
  .attr("y", d => ybar(d.temp))
  .attr("width", xbar.bandwidth())
  .attr("height", d => height2 - ybar(d.temp))
  .attr("fill", (_, i) => i % 2 === 0 ? "black" : "yellow"); 

g2.append("line")
  .attr("x1", 0)
  .attr("x2", width2)
  .attr("y1", ybar(avgDay))
  .attr("y2", ybar(avgDay))
  .attr("stroke", "gold")
  .attr("stroke-width", 2)
  .attr("stroke-dasharray", "3 3");

// 夜平均（黒）
g2.append("line")
  .attr("x1", 0)
  .attr("x2", width2)
  .attr("y1", ybar(avgNight))
  .attr("y2", ybar(avgNight))
  .attr("stroke", "black")
  .attr("stroke-width", 2)
  .attr("stroke-dasharray", "3 3");


svg2.append("text")
  .attr("x", margin2.left / 2)
  .attr("y", height2 / 2 + margin2.top)
  .attr("transform", `rotate(-90, ${margin2.left / 2}, ${height2 / 2 + margin2.top})`)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Body Temperature (°C)");

svg2.append("text")
  .attr("x", width2 / 2 + margin2.left)
  .attr("y", height2 + margin2.top + 50)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Time (minutes)");



const legendContainer = d3.select("body")  // または適切な要素に変更
  .append("div")
  .attr("class", "bar-legend")
  .style("margin", "10px 0");

const legendData = [
  { label: "Daytime", color: "yellow" },
  { label: "Night", color: "black" }
];

const legendItems = legendContainer.selectAll("div")
  .data(legendData)
  .enter()
  .append("div")
  .style("display", "flex")
  .style("align-items", "center")
  .style("margin-bottom", "4px");

legendItems.append("div")
  .style("width", "15px")
  .style("height", "15px")
  .style("margin-right", "5px")
  .style("background-color", d => d.color)
  .style("border", "1px solid #000");

legendItems.append("span")
  .text(d => d.label);
