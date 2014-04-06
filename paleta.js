var loadImage = function(src, cb) {
    var img = new Image();
    img.src = src;
    img.onload = function() {
        cb(null, img);
    };
    img.onerror = function() {
        cb('IMAGE ERROR', null);
    };
};

queue()
    .defer(loadImage, "bedroom.jpg")
    .await(ready);

function ready(error, img){
    var c = conteoColores(img);
    var w = c.w;
    var h = c.h;
    var colorescontados = c.col;
    var colorespartidos = particionColores(colorescontados);
    var colorespromediados = colorespartidos.map(promedioColores);
    var root = {"name": "root", "children": colorespromediados};
    var width = 900;
    var height = 900 * h / w;
    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d){return d.value;});
    var div = d3.select("#treemap").append("div")
        .style("position", "relative")
        .style("width", width + "px")
        .style("height", height + "px");
    var node = div.datum(root).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? null : d.name; });
}

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function promedioColores(listacolores){
    var p = listacolores.map(extraerPesos).reduce(sumaPesos);
    var colorprom = listacolores.map(colorPesado).reduce(sumaVectores);
    colorprom = colorprom.map(function(c){
        return Math.floor(c/p);
    });
    var colhex = d3.rgb(colorprom[0], colorprom[1], colorprom[2]).toString();
    return {"name": colhex, "value": p};
}

function particionColores(c){
    var nodos = [c];
    for(var i=0; i<8; i++){
        var colorplane = i % 3;
        var nuevosnodos = [];
        for(var j=0; j<nodos.length; j++){
            var nodo = nodos[j];
            nodo.sort(function(a,b){
                return a.rgb[colorplane] - b.rgb[colorplane];
            });
            var m = nodo.length;
            var half = Math.floor(m/2);
            var nodoizq = nodo.slice(0, half);
            var nododer = nodo.slice(half, m);
            nuevosnodos.push(nodoizq, nododer);
        }
        nodos = nuevosnodos;
    }
    return nodos;
}

function sumaVectores(a,b){
    var output = a;
    for(i = 0 ; i < a.length; i++){
        output[i] += b[i];
    }
    return output;
}

function colorPesado(a){
    return a.rgb.map(function(c){
        return c * a.valor;
    });
}

function extraerPesos(a){
    return a.valor;
}

function sumaPesos(a, b){
    return a + b;
}

function conteoColores(img){
    var context = document.getElementById('hidden-canvas').getContext('2d');

    var c = d3.select("#hidden-canvas")
        .attr("width", img.width)
        .attr("height", img.height);

    context.drawImage(img, 0, 0, img.width, img.height);

    var w = img.width;
    var h = img.height;

    var colores = d3.map();
    if (w >= h){
        esp = Math.floor(h / 100);
    }
    else{
        esp = Math.floor(w / 100);
    }

    for(var i=0;i< Math.floor(w/esp);i++){
        for(var j=0; j< Math.floor(h/esp); j++){
            var punto = [esp * i, esp * j];
            var colorrgb = context.getImageData(punto[0], punto[1], 1, 1).data;
            var col = d3.rgb(colorrgb[0], colorrgb[1], colorrgb[2]).toString();
            var color = [colorrgb[0], colorrgb[1], colorrgb[2]];
            var entry = colores.get(col) || {"rgb": color, "valor": 0};
            entry.valor++;
            colores.set(col, entry);
        }
    }

    return {"w": w, "h": h, "col": colores.values()};
}
