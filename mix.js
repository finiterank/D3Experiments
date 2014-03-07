var urluno = "amanecer.jpg";
var urldos = "javier.jpg";
var esp = 9;
var imguno = new Image(),
	imgdos = new Image();
imguno.src = urluno;
imgdos.src = urldos;

imguno.onload = function(){
	console.log("¡Lista la primera imagen!");
	imgdos.onload = function(){
			console.log("¡Lista la segunda imagen!");
			d3.select('#message').style("display", "none");
			console.log("¡Listo el pollo!");
 			main();		
	}
}

function main(){
	var contextuno = document.getElementById('hidden-canvas-uno').getContext('2d');
	var contextdos = document.getElementById('hidden-canvas-dos').getContext('2d');

	var cuno = d3.select("#hidden-canvas-uno")
		.attr("width", imguno.width)
		.attr("height", imguno.height);

	var cdos = d3.select("#hidden-canvas-dos")
		.attr("width", imgdos.width)
		.attr("height", imgdos.height);


	contextuno.drawImage(imguno, 0, 0, imguno.width, imguno.height);
	contextdos.drawImage(imgdos, 0, 0, imgdos.width, imgdos.height);

	// Se asume que ambas imágenes tienen el mismo tamaño. Se podría hacer con imágenes con la misma proporción. Después lo hago.
	// También se puede hacer una función que haga todo esto para las dos imágenes por separado para no tener que andar repitiendo tanto.
	// Después indago cómo. 

	var w = imguno.width;
	var	h = imguno.height;

	var tabla = [];

	for(var i=0;i< Math.floor(w/esp);i++){
		for(var j=0; j< Math.floor(h/esp); j++){
			var punto = [esp * i, esp * j];
			var colorrgbuno = contextuno.getImageData(punto[0], punto[1], 1, 1).data;
			var coloruno = d3.rgb(colorrgbuno[0], colorrgbuno[1], colorrgbuno[2]).toString();
			var colorrgbdos = contextdos.getImageData(punto[0], punto[1], 1, 1).data;
			var colordos = d3.rgb(colorrgbdos[0], colorrgbdos[1], colorrgbdos[2]).toString();
			tabla.push({"x": punto[0], "y": punto[1], "coloruno": coloruno, "colordos": colordos});
		}
	}


	function distanciaCuadradaPunto(a, p){
		return Math.pow(a.x - p.x, 2) + Math.pow(a.y - p.y, 2);

	}

	function orderDistancia(a, b, centro){
		return distanciaCuadradaPunto(a, centro) - distanciaCuadradaPunto(b, centro);
	}

	var datos = {"espacio": esp, "xdim": w, "ydim": h, "tabla": tabla}
	

	var imagewidth = datos.xdim,
		imageheight = datos.ydim,
		ballradius = datos.espacio / 2,
		width = parseFloat(d3.select(container).style("width")),
		height = width * imageheight / imagewidth;

	var xScale = d3.scale.linear()
    	.range([0, width]);

	var yScale = d3.scale.linear()
		.range([0, height]);

	var colScale = d3.scale.linear()
		.range([0, 1.3])
		.domain([255, 0]);

	var svg = d3.select("#foto").append("svg")
    	.attr("width", width)
    	.attr("height", height);


	xScale.domain(d3.extent(datos.tabla, function(d) { return d.x; })).nice();
	yScale.domain(d3.extent(datos.tabla, function(d) { return d.y; })).nice();

	var puntos = svg.selectAll(".dot")
    	.data(datos.tabla)
    	.enter().append("circle")
    		.attr("class", "dot")
     		.attr("r",  function(d){
      			var col = d3.rgb(d.colordos);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);
      		})
      		.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
      		.style("fill-opacity", 1)
      		.style("fill", function(d){return d.coloruno;}) 
      		.style("stroke-width", 0);
      		//.on("click", function(d){transformer(d);});

	d3.select(window).on('resize', resize); 

	function resize(){
		width = parseFloat(d3.select(container).style("width"));
		height = width * imageheight / imagewidth;

		xScale.range([0, width]);	
		yScale.range([0, height]);

		svg
			.attr("width", width)
			.attr("height", height);

		d3.selectAll(".dot")
    	  	.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
      		.attr("r",  function(d){
      			var col = d3.rgb(d.colordos);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);
      		});

      	d3.selectAll(".newdot")
     		.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
      		.attr("r",  function(d){
      			var col = d3.rgb(d.coloruno);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);});
	}

	function transformer(h){
		puntos
			.sort(function(a,b){
		 	var centro = {"x": h.x, "y": h.y};
		 	return orderDistancia(a, b, centro);
			})
			.transition()
			.delay(function(d,i){return i * 1;})
			.duration(1000)
			.ease("linear")
			.attr("class", "newdot")
			.attr("r",  function(d){
      			var col = d3.rgb(d.coloruno);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);})
			.style("fill", function(d){ return d.colordos;});
	}
}