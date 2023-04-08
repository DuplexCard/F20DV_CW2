function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", reveal);
  
d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/2186cb19bd7ce096f0d734e81671c2c00867d38b/Data/Educational%20Attainment%20New.csv").then(data => {
    // extract the most recent datapoint by year for each country
    // Extract the country names with the value of their most recent datapoint
    var countryValues = data.map(function(d) {
      var value = +d["2020 [YR2020]"] || +d["2019 [YR2019]"] || +d["2018 [YR2018]"] || +d["2017 [YR2017]"] || +d["2016 [YR2016]"] || +d["2015 [YR2015]"];
      return { country: d["Country Code"], education: value };
    }).filter(function(d) {
      return !isNaN(d.education);
    });
  
    d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/8b5a4710e175b71cdce7bef9f45632f8896a8041/Data/Crime%20Index.csv").then(function(crimeData) {
      // Loop through the countryValues array
      countryValues.forEach(function(country) {
        // Find the matching country in the crimeData array
        var matchingCountry = crimeData.find(function(d) { return d.cca3 === country.country; });
        // If there is a matching country, append the crime index value
        if (matchingCountry) {
          country.crimeIndex = +matchingCountry.crimeIndex;
        }
      });
  
      d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/8b5a4710e175b71cdce7bef9f45632f8896a8041/Data/total-gov-expenditure-gdp-wdi.csv").then(function(expenseData) {
        // Loop through the countryValues array
        countryValues.forEach(function(country) {
          // Find the matching country in the expenseData array
          var matchingCountry = expenseData.find(function(d) { return d.Code === country.country; });
          // If there is a matching country, append the expense value
          if (matchingCountry) {
            country.expense = +matchingCountry["Expense (% of GDP)"];
          }
        });

        countryValues = countryValues.filter(function(d) {
    return d.hasOwnProperty('country') && d.hasOwnProperty('education') && d.hasOwnProperty('crimeIndex') && d.hasOwnProperty('expense');
  });


  console.log(countryValues)
const data = countryValues
/*
    // 4. Create SVG container
    const width = 800;
    const height = 600;
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 5. Define scales and axes
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.expense))
        .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.education))
        .range([innerHeight, 0]);

    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.crimeIndex))
        .interpolator(d3.interpolateBlues);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis);

    g.append('g')
        .call(yAxis);

    // 6. Add the data points
    g.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.expense))
        .attr('cy', d => yScale(d.education))
        .attr('r', 8)
        .attr('fill', d => colorScale(d.crimeIndex))
        .attr('opacity', 0.7);

    // 7. Add tooltips
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

        g.selectAll('circle')
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', 1);
            tooltip.html(`Country: ${d.country}<br>Education: ${d.education.toFixed(2)}<br>Crime Index: ${d.crimeIndex}<br>Expense: ${d.expense.toFixed(2)}%`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            d3.select(event.currentTarget).attr('r', 12).attr('opacity', 1);
        })
        .on('mouseout', (event) => {
            tooltip.style('opacity', 0);
            d3.select(event.currentTarget).attr('r', 8).attr('opacity', 0.7);
        });

    // 8. Create a legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right}, ${margin.top})`);

    const numColors = 10;
    const colorLegendScale = d3.scaleLinear()
        .domain([0, numColors - 1])
        .range(d3.extent(data, d => d.crimeIndex));

    const legendData = Array.from({length: numColors}, (_, i) => colorLegendScale(i));

    const legendHeight = 200;
    const legendItemHeight = legendHeight / numColors;

    legend.selectAll('rect')
        .data(legendData)
        .join('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * legendItemHeight)
        .attr('width', 20)
        .attr('height', legendItemHeight)
        .attr('fill', d => colorScale(d));

    const legendAxis = d3.axisRight(d3.scaleLinear()
        .domain(d3.extent(data, d => d.crimeIndex))
        .range([legendHeight, 0]));

    legend.append('g')
        .attr('transform', `translate(20, 0)`)
        .call(legendAxis);

    legend.append('text')
        .attr('x', -10)
        .attr('y', -10)
        .text('Crime Index')
        .attr('text-anchor', 'end');

        

____________________________________________________________________________
*/  
        function correlation(xValues, yValues) {
          const xMean = d3.mean(xValues);
          const yMean = d3.mean(yValues);
          const xStdDev = d3.deviation(xValues);
          const yStdDev = d3.deviation(yValues);
  
          const n = xValues.length;
          let sum = 0;
  
          for (let i = 0; i < n; i++) {
              sum += ((xValues[i] - xMean) / xStdDev) * ((yValues[i] - yMean) / yStdDev);
          }
  
          return sum / (n - 1);
      }


        const keys = ['education', 'crimeIndex', 'expense'];
        const correlationData = keys.map(xKey => keys.map(yKey => {
            const xValues = data.map(d => d[xKey]);
            const yValues = data.map(d => d[yKey]);
            const corr = correlation(xValues, yValues);
            return {x: xKey, y: yKey, value: corr};
        })).flat();
    
        // 2. Create SVG container
        const margin = {top: 20, right: 80, bottom: 20, left: 20},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
    
        const svg = d3.select("#corr")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // 3. Define the scales and axes
        const domain = Array.from(new Set(correlationData.map(function (d) {
            return d.x

          })));

          const color = d3.scaleLinear()
              .domain([-1, 0, 1])
              .range(["#B22222", "#fff", "#000080"]);
      
          const size = d3.scaleSqrt()
              .domain([0, 1])
              .range([0, 9]);
      
          const x = d3.scalePoint()
              .range([0, width])
              .domain(domain);
      
          const y = d3.scalePoint()
              .range([0, height])
              .domain(domain);
      
          // 4. Create elements for each cell of the correlogram
          const cor = svg.selectAll(".cor")
              .data(correlationData)
              .join("g")
              .attr("class", "cor")
              .attr("transform", function (d) {
                  return `translate(${x(d.x)}, ${y(d.y)})`;
              });
      
          // 5. Add text and circles as needed
          cor.filter(function (d) {
              const ypos = domain.indexOf(d.y);
              const xpos = domain.indexOf(d.x);
              return xpos <= ypos;
          })
              .append("text")
              .attr("y", 5)
              .attr("x", -15)
              .text(function (d) {
                  if (d.x === d.y) {
                      return d.x;
                  } else {
                      return d.value.toFixed(2);
                  }
              })
              .style("font-size", 14)
              .style("text-align", "center")
              .style("fill", function (d) {
                  if (d.x === d.y) {
                      return "#000";
                  } else {
                      return color(d.value);
                  }
              });
      
          cor.filter(function (d) {
              const ypos = domain.indexOf(d.y);
              const xpos = domain.indexOf(d.x);
              return xpos > ypos;
          })
              .append("circle")
              .attr("r", function (d) {
                  return size(2*Math.abs(d.value));
              })
              .style("fill", function (d) {
                  if (d.x === d.y) {
                      return "#000";
                  } else {
                      return color(d.value);
                  }
              })
              
              .style("opacity", 1);
  
      

//_________________________________________________________________________

function createScatterPlot(container, yKey, data, brushended) {
  const margin = { top: 50, right: 30, bottom: 50, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.expense)])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yKey])])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  const circles = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.expense))
    .attr("cy", (d) => y(d[yKey]))
    .attr("r", 4)
    .style("fill", "steelblue")
    .style("opacity", 0.8);

  function updateChart(filteredData) {
    circles.classed("selected", (d) => {
      if (!filteredData) {
        return false;
      }
      return filteredData.some((fd) => fd.country === d.country);
    });
  }


 
  svg.call(
    d3.brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("end", (event) => brushended(event, yKey, { x, y }, updateChart))
  );
  svg
  .append("text")
  .attr("class", "x label")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + 0.95*margin.bottom)
  .style("fill", "black")
  .text("Expense");

// Add y-axis label
svg
.append("text")
.attr("class", "y label")
.attr("text-anchor", "middle")
.attr("y", -margin.left + 20)
.attr("x", -height / 2)
.attr("dy", "1em")
.attr("transform", "rotate(-90)")
.style("fill", "black")
.text(yKey);


  return {
    svg,
    x,
    y,
    update: updateChart,
  };
}

function brushended(event, yKey, chart, updateCurrent) {
  const selection = event.selection;
  const { x, y } = chart;
  const extent = selection && [
    x.invert(selection[0][0]),
    x.invert(selection[1][0]),
    y.invert(selection[1][1]),
    y.invert(selection[0][1]),
  ];

  if (extent) {
    const filteredData = data.filter(
      (d) =>
        d.expense >= extent[0] &&
        d.expense <= extent[1] &&
        d[yKey] >= extent[2] &&
        d[yKey] <= extent[3]
    );
    updateScatter1(filteredData);
    updateScatter2(filteredData);
  } else {
    updateScatter1(undefined);
    updateScatter2(undefined);
  }
}

const scatterPlot1 = createScatterPlot(
  "#scatter1",
  "education",
  data,
  brushended
);
const scatterPlot2 = createScatterPlot(
  "#scatter2",
  "crimeIndex",
  data,
  brushended
);

updateScatter1 = scatterPlot1.update;
updateScatter2 = scatterPlot2.update;




//_________________________________

const svg2 = d3
  .select('#my_dataviz')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Add X axis
const x2 = d3.scaleLinear().domain([5, 50]).range([0, width]);
svg2
  .append('g')
  .attr('transform', 'translate(0,' + height + ')')
  .call(d3.axisBottom(x2));

// Add Y axis
const y2 = d3.scaleLinear().domain([5, 30]).range([height, 0]);
svg2.append('g').call(d3.axisLeft(y2));

// Compute the density data
const densityData = d3
  .contourDensity()
  .x((d) => x2(d.expense))
  .y((d) => y2(d.education))
  .weight((d) => d.crimeIndex)
  .size([width, height])
  .bandwidth(20) // smaller = more precision in lines = more lines
  .thresholds(20)(data);

// Add the contour: several "path"
svg2
  .selectAll('path')
  .data(densityData)
  .enter()
  .append('path')
  .attr('d', d3.geoPath())
  .attr('fill', 'none')
  .attr('stroke', '#69b3a2')
  .attr('stroke-linejoin', 'round');
      });
    });
  });
  