// Atividade 1: Sandwiches

// 1. Carregar os dados do ficheiro sandwiches.csv
d3.csv("data/sandwiches.csv").then(sandwiches => {
    
    // Converter o preço de texto para número 
    sandwiches.forEach(d => {
        d.price = +d.price;
    });

    // 2. Criar o contentor SVG na div 
    const svg1 = d3.select("#activity1")
        .append("svg")
        .attr("width", 500)
        .attr("height", 250); 

    // 3. Desenhar os Círculos
    svg1.selectAll("circle")
        .data(sandwiches)
        .enter()
        .append("circle")
        // Espalhar os círculos no eixo X (espaçamento de 80px)
        .attr("cx", (d, i) => (i * 80) + 50) 
        .attr("cy", 100) // Posição fixa no eixo Y
        // Raio: "large" é o dobro de "small"
        .attr("r", d => d.size === "large" ? 20 : 10)
        // Cores: < 7.00 é verde, os outros são laranja
        .attr("fill", d => d.price < 7.00 ? "#4CAF50" : "#FF9800")
        .attr("stroke", "#333")
        .attr("stroke-width", 2);

    // 4. Adicionar os nomes das sanduíches
    svg1.selectAll("text")
        .data(sandwiches)
        .enter()
        .append("text")
        .attr("x", (d, i) => (i * 80) + 50)
        .attr("y", 150)
        .attr("text-anchor", "middle") // Centrar texto
        .attr("font-size", "12px")
        .text(d => d.name);

}).catch(error => {
    console.error("Erro a carregar o sandwiches.csv:", error);
});


// Atividade 2: Cidades Europeias

// 1. Carregar os dados do CSV
d3.csv("data/cities_and_population.csv").then(data => {
    
    // 2. Filtrar as cidades para manter apenas as da UE
    const euCities = data.filter(d => d.eu === "true");

    // 3. Adicionar o parágrafo com a contagem na div correta
    d3.select("#activity2")
        .append("p")
        .style("font-weight", "bold")
        .text(`Number of cities: ${euCities.length}`);

    // 4. Converter as strings do CSV para números
    euCities.forEach(d => {
        d.population = +d.population;
        d.x = +d.x;
        d.y = +d.y;
    });

    // 5. Criar o contentor SVG para o mapa
    const svg2 = d3.select("#activity2")
        .append("svg")
        .attr("width", 700)
        .attr("height", 550);

    // 6. Desenhar os círculos usando as coordenadas x e y do CSV
    svg2.selectAll("circle")
        .data(euCities)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        // Raio: < 1.000.000 = 4px, caso contrário 8px
        .attr("r", d => d.population < 1000000 ? 4 : 8)
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    // 7. Adicionar os nomes das cidades
    svg2.selectAll("text")
        .data(euCities)
        .enter()
        .append("text")
        .attr("class", "city-label") // Liga à classe CSS do HTML
        .attr("x", d => d.x)
        .attr("y", d => d.y - 12) // Subir o texto para não sobrepor a bolha
        // Opacidade: Mostrar nome apenas se pop >= 1.000.000
        .attr("opacity", d => d.population >= 1000000 ? 1 : 0)
        .text(d => d.city);

}).catch(error => {
    console.error("Erro a carregar cities_and_population.csv:", error);
});