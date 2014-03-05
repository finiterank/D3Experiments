var archivo = "output.json"
d3.json(archivo, function(error, datos) {
	datos.xdim = +datos.xdim;
	datos.ydim = +datos.ydim;
	datos.espacio = + datos.espacio;

  	datos.tabla.forEach(function(d) {
    	d.x = +d.x;
    	d.y = +d.y;
  	});

  	var imagewidth = datos.xdim,
		imageheight = datos.ydim,
		ballradius = datos.espacio / 2,
		width = parseFloat(d3.select("#container").style("width")),
		height = width * imageheight / imagewidth;

	var xScale = d3.scale.linear()
    	.range([0, width]);

	var yScale = d3.scale.linear()
	    .range([0, height]);

	var svg = d3.select("#foto").append("svg")
    	.attr("width", width)
    	.attr("height", height);


	xScale.domain(d3.extent(datos.tabla, function(d) { return d.x; })).nice();
	yScale.domain(d3.extent(datos.tabla, function(d) { return d.y; })).nice();

	var puntos = svg.selectAll(".dot")
      .data(datos.tabla)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r",  xScale(ballradius))
      .attr("cx", function(d) { return xScale(d.x); })
      .attr("cy", function(d) { return yScale(d.y); })
      .style("fill-opacity", 0.4)
      .style("fill", function(d){
      		var col = d3.rgb(d.color);
	      	var average = (col.r + col.g + col.b)/3;
	      	if(average < 128){ return "#000000";}
	      	else{return "#FFFFFF";}
      	}) 
      .style("stroke-width", 0)
      .on("click", transformer);

    d3.select(window).on('resize', resize); 

	function resize(){
		width = parseFloat(d3.select("#container").style("width"));
		height = width * imageheight / imagewidth;

		xScale.range([0, width]);

		yScale.range([0, height]);

		svg
			.attr("width", width)
		   	.attr("height", height);

		puntos
			.attr("r", xScale(ballradius))
      		.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
	}

	function transformer(){
		puntos.data(datos.tabla)
			.transition()
			.delay(function(d,i){return i * 1;})
			.duration(1000)
			.ease("linear")
			.style("fill-opacity", 1)
			.style("fill", function(d){ return d.color;});
	}
});