/**
 * CLASSE 1: Gráfico de Barras com Animação
 */
class BarChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 200,
      margin: { top: 10, right: 20, bottom: 40, left: 50 }
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Escalas [cite: 1, 143, 146]
    vis.xScale = d3.scaleLinear().range([0, vis.width]);
    vis.yScale = d3.scaleBand().range([0, vis.height]).paddingInner(0.15);

    // Eixos [cite: 1, 150]
    vis.xAxisGroup = vis.chart.append('g').attr('transform', `translate(0, ${vis.height})`);
    vis.yAxisGroup = vis.chart.append('g');

    this.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.xScale.domain([0, d3.max(vis.data, d => d.sales)]);
    vis.yScale.domain(vis.data.map(d => d.month));
    this.renderVis();
  }

  renderVis() {
    let vis = this;
    let bars = vis.chart.selectAll('.bar').data(vis.data);

    bars.enter().append('rect').attr('class', 'bar')
      .merge(bars)
      .attr('y', d => vis.yScale(d.month))
      .attr('height', vis.yScale.bandwidth())
      .attr('x', 0)
      .style('fill', 'steelblue')
      .transition().duration(1000) // Animação de "crescimento"
      .attr('width', d => vis.xScale(d.sales));

    vis.xAxisGroup.call(d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0));
    vis.yAxisGroup.call(d3.axisLeft(vis.yScale).tickSizeOuter(0));
  }
}

/**
 * CLASSE 2: Gráfico de Área com Forecast e Interatividade
 */
class AreaChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 550,
      containerHeight: 250,
      margin: { top: 20, right: 50, bottom: 40, left: 50 }
    };
    this.data = _data;
    this.displayData = _data; 
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xScale = d3.scalePoint().range([0, vis.width]).padding(0.2);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxisGroup = vis.chart.append('g').attr('transform', `translate(0, ${vis.height})`);
    vis.yAxisGroup = vis.chart.append('g');

    // Caminhos para Área e Linha [cite: 1, 318]
    vis.areaPath = vis.chart.append('path');
    vis.linePath = vis.chart.append('path');

    // Tooltip
    vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    this.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.xScale.domain(vis.displayData.map(d => d.month));
    vis.yScale.domain([0, d3.max(vis.displayData, d => d.sales) * 1.2]);
    this.renderVis();
  }

  renderVis() {
    let vis = this;

    // Geradores de formas [cite: 1, 323, 333]
    const areaGen = d3.area()
      .x(d => vis.xScale(d.month)).y1(d => vis.yScale(d.sales))
      .y0(vis.height).curve(d3.curveMonotoneX);

    const lineGen = d3.line()
      .x(d => vis.xScale(d.month)).y(d => vis.yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Desenho da Área (Azul Claro)
    vis.areaPath.datum(vis.displayData)
      .transition().duration(1000)
      .attr('d', areaGen).attr('fill', 'lightblue').attr('opacity', 0.6);

    // Desenho da Linha (Steelblue)
    vis.linePath.datum(vis.displayData)
      .transition().duration(1000)
      .attr('d', lineGen).attr('fill', 'none').attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', d => d.length > vis.data.length ? "5,5" : "none");

    // Pontos interativos
    const dots = vis.chart.selectAll('.dot').data(vis.displayData);
    dots.enter().append('circle').attr('class', 'dot')
      .merge(dots)
      .on('mouseover', (event, d) => {
        vis.tooltip.style('display', 'inline-block')
          .html(`<strong>Mês:</strong> ${d.month}<br><strong>Vendas:</strong> ${d.sales}€`);
      })
      .on('mousemove', (event) => {
        vis.tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', () => vis.tooltip.style('display', 'none'))
      .transition().duration(1000)
      .attr('cx', d => vis.xScale(d.month)).attr('cy', d => vis.yScale(d.sales))
      .attr('r', 5).attr('fill', d => d.forecast ? 'orange' : 'steelblue');

    vis.xAxisGroup.call(d3.axisBottom(vis.xScale));
    vis.yAxisGroup.call(d3.axisLeft(vis.yScale));
  }

  addForecast() {
    const last = this.data[this.data.length - 1];
    const prev = this.data[this.data.length - 2];
    const trend = last.sales - prev.sales; 

    let fData = [...this.data];
    for(let i=1; i<=3; i++) {
        fData.push({ month: `Prev-${i}`, sales: Math.max(0, last.sales + (trend * i)), forecast: true });
    }
    this.displayData = fData;
    this.updateVis();
  }
}

/**
 * LOGICA DE CARREGAMENTO E MENU
 */
let bChart, aChart;

d3.csv("data/sales.csv").then(data => {
    data.forEach(d => { d.sales = +d.sales; }); // Conversão numérica [cite: 1, 203]

    bChart = new BarChart({ parentElement: '#chart' }, data);
    aChart = new AreaChart({ parentElement: '#area-chart' }, data);
});

const menu = document.getElementById('grafico-menu');
menu.addEventListener('change', function() {
    document.getElementById('bar-section').style.display = (this.value === 'barras') ? 'block' : 'none';
    document.getElementById('area-section').style.display = (this.value === 'linha') ? 'block' : 'none';
});

document.getElementById('forecast-btn').addEventListener('click', () => {
    if(aChart) aChart.addForecast();
});