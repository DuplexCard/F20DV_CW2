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
  
d3.csv("https://raw.githubusercontent.com/DuplexCard/F20DV_CW2/8b5a4710e175b71cdce7bef9f45632f8896a8041/Data/Educational%20Attainment.csv").then(data => {
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

const data = countryValues

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
      });
    });
  });
  