// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVarGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function conversion(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x,y];
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related to UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_segments=10;
let g_selectedType=POINT;

function addActionsForHtmlUI() {
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
    document.getElementById('drawing').onclick = function() { defaultDraw(); };

    document.getElementById('redSlide').addEventListener('mouseup',   function() {g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup',  function() {g_selectedColor[2] = this.value/100; });
    document.getElementById('sizeSlider').addEventListener('mouseup', function() {g_selectedSize = this.value});
    document.getElementById('segments').addEventListener('mouseup', function() {g_segments = this.value});

    document.getElementById('clear').onclick = function() {g_shapesList = []; g_drawing = 0; renderShapes();};
    document.getElementById('point').onclick = function() {g_selectedType=POINT};
    document.getElementById('triangle').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circle').onclick = function() {g_selectedType=CIRCLE};
}

function main() {
  setupWebGL();
  connectVarGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) { click(ev)}};
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

//  var g_points = [];  // The array for the position of a mouse press
//  var g_colors = [];  // The array to store the color of a point
//  var g_sizes = [];

function click(ev) {
  let [x,y] = conversion(ev);

  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  point.segments=g_segments;
  g_shapesList.push(point);
  renderShapes();
}

function renderShapes() {
  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  let temp_color = g_selectedColor;
  if (g_drawing==1) {
    defaultDraw();
  }
  g_selectedColor = temp_color;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

let g_drawing = 0;
function defaultDraw() {
  g_drawing = 1;
  gl.uniform4f(u_FragColor, 1, 1, 1, 1);
  drawTriangle([-.5, 0, -.25, 0, -.25, -.5]);
  drawTriangle([-.5, 0, -.4, .2, -.4, 0]);
  drawTriangle([-.5, .4, -.4, .2, -.4, .4]);
  drawTriangle([.45, 0, -.4, 0, -.4, .4]);
  drawTriangle([.45, 0, .45, .4, -.4, .4]);
  drawTriangle([.55, .4, -.5, .45, -.5, .4]);
  drawTriangle([-.5, .45, .55, .4, .55, .45]);
  drawTriangle([-.5, .45, -.35, .8, -.35, .45]);
  drawTriangle([.55, .45, -.35, .8, -.35, .45]);
  drawTriangle([.55, .45, -.35, .8, .55, .8]);
  drawTriangle([0, .9, -.35, .8, 0, .8]);
  drawTriangle([0, .9, .3, .8, 0, .8]);
  drawTriangle([0, .9, .3, .8, .3, .9]);
  drawTriangle([.55, .8, .3, .8, .3, .9]);
  drawTriangle([.55, .8, .55, .4, .65, .4]);
  drawTriangle([.45, .4, .45, 0, .65, .4]);
  drawTriangle([-.25, 0, -.25, -.5, .1, -.5]);
  drawTriangle([-.25, 0, .1, 0, .1, -.5]);
  drawTriangle([.1, -.15, .1, 0, .45, -.15]);
  drawTriangle([.45, 0, .1, 0, .45, -.15]);
  drawTriangle([.1, -.5, .1, 0, .45, -.15]);
  drawTriangle([.55, 0, .45, 0, .50, -.05]);
  drawTriangle([.55, 0, .6, .20, .55, .4]);
  drawTriangle([.55, 0, .45, 0, .55, .2]);
}