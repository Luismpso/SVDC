// Parte 1: Definir a classe do gráfico de barras

class BarChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: _config.margin || { top: 5, right: 20, bottom: 20, left: 50 }
    };
    this.data = _data;
    
    // Chama a inicialização
    this.initVis();
  }

  initVis() {
    let vis = this;
    
    // Calcula largura e altura disponíveis
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Adiciona o SVG principal
    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Adiciona o grupo com as margens aplicadas
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Inicializa escalas (apenas o range)
    vis.xScale = d3.scaleLinear().range([0, vis.width]);
    vis.yScale = d3.scaleBand().range([0, vis.height]).paddingInner(0.15);

    // Inicializa os eixos
    vis.xAxis = d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0);
    vis.yAxis = d3.axisLeft(vis.yScale).tickSizeOuter(0);

    // Adiciona os grupos dos eixos ao gráfico
    vis.xAxisGroup = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${vis.height})`);

    vis.yAxisGroup = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // Processa os dados
    this.updateVis();
  }

  updateVis() {
    let vis = this;
    
    // Funções de acesso aos dados
    vis.xValue = d => d.sales; 
    vis.yValue = d => d.month;

    // Atualiza os domínios
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain(vis.data.map(vis.yValue));

    // Renderiza o gráfico
    this.renderVis();
  }

  renderVis() {
    let vis = this;
    
    let bars = vis.chart.selectAll('.bar').data(vis.data);

    // Desenha as barras
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', d => vis.xScale(vis.xValue(d)))
      .attr('height', vis.yScale.bandwidth())
      .attr('y', d => vis.yScale(vis.yValue(d)))
      .attr('x', 0)
      .style('fill', 'steelblue')
      .style('shape-rendering', 'crispEdges');

    // Atualiza os eixos visualmente
    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);
  }
}

// Parte 2: Carregar os dados e criar o gráfico de barras

d3.csv("data/sales.csv").then(data => {
    // Converte a coluna 'sales' para números
    data.forEach(d => {
        d.sales = +d.sales; 
    });

    // Instancia e desenha o gráfico de barras
    let myChart = new BarChart({
        parentElement: '#chart', 
    }, data);
});

// Parte 3: Desenhar um gráfico de linha e área usando os geradores de D3

// Dados de exemplo do guião para desenhar linhas/áreas
const pathData = [
  {x: 0, y: 10}, 
  {x: 100, y: 75}, 
  {x: 300, y: 90}, 
  {x: 350, y: 20}
];

// Contentor SVG para este novo gráfico
const svgPath = d3.select('#area-chart')
  .append('svg')
  .attr('width', 500)
  .attr('height', 200); 

// Gerador de Área
const area = d3.area()
  .x(d => d.x)      
  .y1(d => d.y)     
  .y0(0)
  .curve(d3.curveMonotoneX);           

// Gerador de Linha
const line = d3.line()
  .x(d => d.x)      
  .y(d => d.y)
  .curve(d3.curveMonotoneX);   

// Desenhar primeiro a Área (para ficar por trás)
svgPath.append('path')
  .attr('d', area(pathData))    
  .attr('fill', 'lightgreen')   
  .attr('stroke', 'none');      

// Desenhar depois a Linha (para ficar por cima da área)
svgPath.append('path')
  .attr('d', line(pathData))    
  .attr('stroke', 'red')        
  .attr('fill', 'none')         
  .attr('stroke-width', 2);

// Parte 4: Lógica menu

// Selecionar o menu e as secções HTML
const menu = document.getElementById('grafico-menu');
const barSection = document.getElementById('bar-section');
const areaSection = document.getElementById('area-section');

// "Ouvir" sempre que o menu muda de valor
menu.addEventListener('change', function() {
    
    // Se o utilizador escolher "barras"
    if (this.value === 'barras') {
        barSection.style.display = 'block';  // Mostra as barras
        areaSection.style.display = 'none';  // Esconde a área
    } 
    // Se o utilizador escolher "linha"
    else if (this.value === 'linha') {
        barSection.style.display = 'none';   // Esconde as barras
        areaSection.style.display = 'block'; // Mostra a área
    }
    
});

