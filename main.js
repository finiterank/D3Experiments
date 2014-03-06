var url = "tekkon.jpg";
var img = new Image();
// img.src = url;
// img.onload = function(){
// 	d3.select('#message').style("display", "none");
// 	main();
// }

function preloader() {
	console.log("Preloader():: " + url + " antes de");
	img.src = url;
	console.log("Preloader():: " + url + " después de");
}

function main(){
	var context = document.getElementById('hidden-canvas').getContext('2d');

	var c = d3.select("#hidden-canvas")
		.attr("width", img.width)
		.attr("height", img.height);

	context.drawImage(img, 0, 0, img.width, img.height);

	var w = img.width;
	var	h = img.height;
	var esp = 20;

	console.log(w, h);

	var tabla = [];

	for(var i=0;i< Math.floor(w/esp);i++){
		for(var j=0; j< Math.floor(h/esp); j++){
			var punto = [esp * i, esp * j];
			var colorrgb = context.getImageData(punto[0], punto[1], 1, 1).data;
			var color = d3.rgb(colorrgb[0], colorrgb[1], colorrgb[2]).toString();
			tabla.push({"x": punto[0], "y": punto[1], "color": color});
		}
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
      			var col = d3.rgb(d.color);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);
      		})
      		.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
      		.style("fill-opacity", 1)
      		.style("fill", "#000000") 
      		.style("stroke-width", 0)
      		.on("click", transformer);

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
      			var col = d3.rgb(d.color);
	    		var factor = colScale((0.3 * col.r) + (0.6 * col.g) + (0.11 * col.b));
      			return factor * xScale(ballradius);
      		})

     	d3.selectAll(".colordot")
     		.attr("cx", function(d) { return xScale(d.x); })
      		.attr("cy", function(d) { return yScale(d.y); })
      		.attr("r", xScale(ballradius))
	}

	function transformer(){
		puntos.data(datos.tabla)
			.transition()
			.delay(function(d,i){return i * 1;})
			.duration(1000)
			.ease("linear")
			.attr("class", "colordot")
			.attr("r", xScale(ballradius))
			.style("fill-opacity", 1)
			.style("fill", function(d){ return d.color;})
			.each("end", function(){
				d3.select(this)
					.on("mouseover", function(){
      					d3.select(this)
      						.transition()
      						.duration(1000)
      						.attr("r", 6 * xScale(ballradius));
      				})
      				.on("mouseout", function(){
      					d3.select(this)
      						.transition()
      						.delay(1000)
      						.duration(1200)
      						.attr("r", xScale(ballradius));
      				});
      			});

	}
}

//when everything is ready
$(document).ready(function(){
	if ( window.console && window.console.log ) {
	  console.log("Init:: vamos a hacer logs!");
	}
	preloader();
	console.log("Init:: Ya hizo el preloader");
	d3.select('#message').style("display", "none");
	main();
});