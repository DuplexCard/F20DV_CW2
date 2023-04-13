// The grand reveal - a function for all your revealing needs.
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  // Looping through reveals, because that's how we roll.
  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;

    // Making things visible or not. It's like magic.
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

// Get ready for some scroll action.
window.addEventListener("scroll", reveal);

// Loading CSVs, just your everyday data-fetching adventure.
d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/2186cb19bd7ce096f0d734e81671c2c00867d38b/Data/Educational%20Attainment%20New.csv").then(data => {
  // Extracting country names and recent datapoints.
  var countryValues = data.map(function (d) {
    var value = +d["2020 [YR2020]"] || +d["2019 [YR2019]"] || +d["2018 [YR2018]"] || +d["2017 [YR2017]"] || +d["2016 [YR2016]"] || +d["2015 [YR2015]"];
    return { country: d["Country Code"], education: value };
  }).filter(function (d) {
    return !isNaN(d.education);
  });

  d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/8b5a4710e175b71cdce7bef9f45632f8896a8041/Data/Crime%20Index.csv").then(function (crimeData) {
    // Matching countries with their respective crime data.
    countryValues.forEach(function (country) {
      // Find the matching country in the crimeData array
      var matchingCountry = crimeData.find(function (d) { return d.cca3 === country.country; });
      // If there is a matching country, append the crime index value
      if (matchingCountry) {
        country.crimeIndex = +matchingCountry.crimeIndex;
      }
    });

    d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/8b5a4710e175b71cdce7bef9f45632f8896a8041/Data/total-gov-expenditure-gdp-wdi.csv").then(function (expenseData) {
      // Loop through the countryValues array
      countryValues.forEach(function (country) {
        // Find the matching country in the expenseData array
        var matchingCountry = expenseData.find(function (d) { return d.Code === country.country; });
        // If there is a matching country, append the expense value
        if (matchingCountry) {
          country.expense = +matchingCountry["Expense (% of GDP)"];
        }
      });

      countryValues = countryValues.filter(function (d) {
        return d.hasOwnProperty('country') && d.hasOwnProperty('education') && d.hasOwnProperty('crimeIndex') && d.hasOwnProperty('expense');
      });

      console.log(countryValues)
      const data = countryValues
      // Correlation function to calculate correlation between two sets of values
      function correlation(xValues, yValues) {
        // Calculate mean and standard deviation for both x and y values
        const xMean = d3.mean(xValues);
        const yMean = d3.mean(yValues);
        const xStdDev = d3.deviation(xValues);
        const yStdDev = d3.deviation(yValues);

        // Get the length of the values
        const n = xValues.length;
        let sum = 0;

        // Loop through the values and calculate the sum
        for (let i = 0; i < n; i++) {
          sum += ((xValues[i] - xMean) / xStdDev) * ((yValues[i] - yMean) / yStdDev);
        }

        // Return the correlation value
        return sum / (n - 1);
      }

      // Define the keys for the correlation data
      const keys = ['education', 'crimeIndex', 'expense'];

      // Map the correlation data and flatten the array
      const correlationData = keys.map(xKey => keys.map(yKey => {
        const xValues = data.map(d => d[xKey]);
        const yValues = data.map(d => d[yKey]);
        const corr = correlation(xValues, yValues);
        return { x: xKey, y: yKey, value: corr };
      })).flat();

      // Create the SVG container with margin, width, and height
      const margin = { top: 20, right: 80, bottom: 20, left: 20 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      // Append the SVG container to the DOM element
      const svg = d3.select("#corr")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define the scales and axes
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

      // Create elements for each cell of the correlogram
      const cor = svg.selectAll(".cor")
        .data(correlationData)
        .join("g")
        .attr("class", "cor")
        .attr("transform", function (d) {
          return `translate(${x(d.x)}, ${y(d.y)})`;
        });

      // Add text and circles as needed
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
            // Because everyone knows black is the new black
            return "#000";
          } else {
            // Oh, look! A color that's not black!
            return color(d.value);
          }
        });

      cor.filter(function (d) {
        const ypos = domain.indexOf(d.y);
        const xpos = domain.indexOf(d.x);
        // Let's only show the cool half of the matrix
        return xpos > ypos;
      })
        .append("circle")
        .attr("r", function (d) {
          // Twice the value, because why not?
          return size(2 * Math.abs(d.value));
        })
        .style("fill", function (d) {
          if (d.x === d.y) {
            // Back in black again, what a surprise!
            return "#000";
          } else {
            // I guess other colors need some love too
            return color(d.value);
          }
        })

        // These circles are not shy at all, full opacity!
        .style("opacity", 1);

      //_________________________________________________________________________
      function createScatterPlot(container, yKey, data, brushended) {
        // Define the margins, width, and height like a pro
        const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

        // Create an SVG element to hold our masterpiece
        const svg = d3
          .select(container)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create the x-axis like a boss
        const x = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.expense)])
          .range([0, width]);
        svg
          .append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

        // Who needs a y-axis? Oh wait, we do!
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d[yKey])])
          .range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // Let's draw some circles. No, seriously, circles!
        const circles = svg
          .append("g")
          .selectAll("circle")
          .data(data)
          .join("circle")
          .attr("cx", (d) => x(d.expense))
          .attr("cy", (d) => y(d[yKey]))
          .attr("r", 4)
          .style("fill", "steelblue")
          .style("opacity", 0.8)

        // Line generator for the regressor line - draw that funky line!
        const lineGenerator = d3.line().x((d) => x(d.x)).y((d) => y(d.y));
        const regressorLine = svg.append("path").attr("class", "regressor-line").style("stroke", "red").style("stroke-width", 2).style("opacity", 0).attr("d", lineGenerator([{ x: 0, y: 0 }, { x: 0, y: 0 }]));

        function animateRegressorLine(data) {
          // Calculate that regressor like a math wizard
          const regressor = linearRegressor(data, x, y, "expense", yKey);
          const lineData = regressor.line();
          // Animate the line because it's fancy
          regressorLine
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .attr("d", lineGenerator(lineData));

          return regressor;

        }
        // Update the chart - let's do some magic!
        function updateChart(filteredData) {
          circles.classed("selected", (d) => {
            if (!filteredData) {
              return false;
            }
            return filteredData.some((fd) => fd.country === d.country);
          });
        }

        // Time to add some brushing action!
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
          .attr("y", height + 0.95 * margin.bottom)
          .style("fill", "black")
          .text("expense");

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
          animateRegressorLine: animateRegressorLine,
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

      function linearRegressor(data, x, y, xKey, yKey) {
        const n = data.length;
        const sumX = d3.sum(data, (d) => d[xKey]);
        const sumY = d3.sum(data, (d) => d[yKey]);
        const sumXY = d3.sum(data, (d) => d[xKey] * d[yKey]);
        const sumX2 = d3.sum(data, (d) => d[xKey] * d[xKey]);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const predictedY = data.map((d) => slope * d[xKey] + intercept);
        const meanY = sumY / n;
        const totalSS = d3.sum(data, (d) => (d[yKey] - meanY) * (d[yKey] - meanY));
        const residualSS = d3.sum(data, (d, i) => (d[yKey] - predictedY[i]) * (d[yKey] - predictedY[i]));

        const rSquared = 1 - residualSS / totalSS;

        return {
          slope,
          intercept,
          rSquared,
          predict: (xVal) => slope * xVal + intercept,
          line: () => [
            { x: x.domain()[0], y: slope * x.domain()[0] + intercept },
            { x: x.domain()[1], y: slope * x.domain()[1] + intercept },
          ],
        };
      }


      function animateRegressor() {
        const data1 = scatterPlot1.svg.selectAll("circle.selected").data();
        const data2 = scatterPlot2.svg.selectAll("circle.selected").data();

        const regressor1 = scatterPlot1.animateRegressorLine(data1);
        const regressor2 = scatterPlot2.animateRegressorLine(data2);

        const postInfo = d3.select("#post-info");
        console.log()
        if (!isNaN(regressor1.slope.toFixed(2))) {
          postInfo.html(`
  
  <br><br>
    <center><h3>Regressor Information</h3></center>
    <br>
    <p><strong>Scatterplot 1 (Expense vs. Education)</strong></p>
    <p>Slope: ${regressor1.slope.toFixed(2)}</p>
    <p>Intercept: ${regressor1.intercept.toFixed(2)}</p>
    <p>R-squared: ${regressor1.rSquared.toFixed(2)}</p>
    <br>
    <p><strong>Scatterplot 2 (Expense vs. Crime Index)</strong></p>
    <p>Slope: ${regressor2.slope.toFixed(2)}</p>
    <p>Intercept: ${regressor2.intercept.toFixed(2)}</p>
    <p>R-squared: ${regressor2.rSquared.toFixed(2)}</p>
    <br>
    <br>
  `)
        } else {
          postInfo.html(`
    <br>
    <br>
    <p><strong> Please select at least 2 points before trying to calculate the regressor.</strong></p>
    <br>
    <br>
  `)
        }
      }
      document.getElementById("animate-regressor-btn").addEventListener("click", animateRegressor);

      //_________________________________
      // Oh look, another margin object! Who would've thought?
      const margin2 = { top: 10, right: 30, bottom: 40, left: 60 },
        width2 = 460 - margin2.left - margin2.right,
        height2 = 400 - margin2.top - margin2.bottom;

      // Let's make an SVG, because why not?
      const svg2 = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", `translate(${margin2.left},${margin2.top})`);

      // Add X axis (because graphs need axes, right?)
      const x2 = d3.scaleLinear()
        .domain([0, 50]) // Adjust x-axis domain according to the data
        .range([0, width2]);
      const xAxis = svg2.append("g")
        .attr("transform", `translate(0,${height2})`)
        .call(d3.axisBottom(x2));

      // Throw in an X axis label, just for kicks
      svg2.append("text")
        .attr("text-anchor", "end")
        .attr("x", width2)
        .attr("y", height2 + margin2.top + 10)
        .text("Expense");

      // We definitely need a Y axis too
      const y2 = d3.scaleLinear()
        .domain([0, 50]) // Adjust y-axis domain according to the data
        .range([height2, 0]);
      const yAxis = svg2.append("g")
        .call(d3.axisLeft(y2));

      // And why not add a Y axis label too?
      svg2.append("text")
        .attr("text-anchor", "end")
        .attr("x", -margin2.left / 2)
        .attr("y", -margin2.top / 2)
        .attr("dy", "0.1em")
        .attr("transform", "rotate(-90)")
        .text("Education");

      // A contour group, because we're fancy like that
      const contourGroup = svg2.append("g");

      // I guess we need some min and max crime index values
      const crimeIndexMin = d3.min(data, d => d.crimeIndex);
      const crimeIndexMax = d3.max(data, d => d.crimeIndex);

      // Let's add some color, just to spice things up
      const colorScale = d3.scaleLinear()
        .domain([crimeIndexMin, crimeIndexMax])
        .range(["yellow", "red"]);

      // Here's a function to check if a point is in a polygon
      // (trust me, we need this)...psssttt....we dont

      function isPointInPolygon(polygon, point) {
        const n = polygon.length;


        let inside = false;



        for (let i = 0, j = n - 1; i < n; j = i++) {
          if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) &&
            (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
            inside = !inside;
          }
        }


        inside = !inside;


        inside
        return inside;
      }

      // Update function, because we like keeping things fresh
      function update(bandwidth, threshold, toggleColorMode) {
        // Compute the density data
        const densityData = d3.contourDensity()
          .x(d => x2(d.expense))
          .y(d => y2(d.education))
          .size([width2, height2])
          .bandwidth(bandwidth)
          .thresholds(threshold)
          (data.map(d => ({ ...d, x: x2(d.expense), y: y2(d.education) })));
        // Update the contour
        const contours = contourGroup.selectAll("path")
          .data(densityData);

        contours.enter()
          .append("path")
          .merge(contours)
          .attr("d", d3.geoPath())
          .attr("fill", function (d) {
            if (toggleColorMode) {
              const coordinates = d.coordinates[0];
              const polygonPoints = coordinates.map(coord => [x2.invert(coord[0]), y2.invert(coord[1])]);


              const containedDataPoints = data.filter(point => isPointInPolygon(polygonPoints, [point.expense, point.education]));
              const avgCrimeIndex = d3.mean(containedDataPoints, point => point.crimeIndex);

              console.log(containedDataPoints)

              return isNaN(avgCrimeIndex) ? "none" : colorScale(avgCrimeIndex);
            } else {
              return "none";
            }
          })


          .attr("stroke", "#69b3a2")
          .attr("stroke-linejoin", "round");

        contours.exit().remove();
      }

      var bandwidthSlider = document.getElementById("bandwidth-slider");
      var thresholdSlider = document.getElementById("threshold-slider");

// You'd think we're done, but nope! Here's a slider for bandwidth
d3.select("#bandwidth-slider")
        .on("input", function () {
          update(+this.value, thresholdSlider.value, false);
        });

// And another slider for threshold, because we can
d3.select("#threshold-slider")
        .on("input", function () {
          update(bandwidthSlider.value, +this.value, false);
        });


// Finally, let's start this party with an initial rendering
update(25, 12, false);

    });
  });
});
