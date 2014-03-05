#!/usr/bin/python

from __future__ import division
import sys
import Image
import json


archivo, resultado, esp = sys.argv[1:]

esp = int(esp)

im = Image.open(archivo)

pix = im.load()

width, height = im.size

puntos = [[esp*i, esp*j] for j in range(int(height/esp)) for i in range(int(width/esp))]

colores = ['#%02x%02x%02x' % pix[a[0],a[1]] for a in puntos] 

tabla = [{"x": punto[0], "y":punto[1], "color":color} for (punto,color) in zip(puntos,colores)] 

conclusion = {"espacio": esp, "xdim": width, "ydim": height, "tabla": tabla}

json.dump(conclusion, open(resultado,'w'))