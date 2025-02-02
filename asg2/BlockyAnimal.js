// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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
let g_globalAngle=0;
let g_globalXAngle=0;
let g_leftArmRot=-10
let g_leftForearmRot=-10;
let g_rightArmRot=10
let g_rightForearmRot=-10;
let g_armSwingAnim=false;
let g_blink=-1;

function addActionsForHtmlUI() {
    document.getElementById('AnimOn').onclick = function() { g_armSwingAnim = true; };
    document.getElementById('AnimOff').onclick = function() { g_armSwingAnim = false; };

    document.getElementById('LeftArm').addEventListener('mousemove',   function() {g_leftArmRot = this.value; renderShapes();});
    document.getElementById('LeftForearm').addEventListener('mousemove', function() {g_leftForearmRot = this.value; renderShapes();});
    document.getElementById('RightArm').addEventListener('mousemove',   function() {g_rightArmRot = this.value; renderShapes();});
    document.getElementById('RightForearm').addEventListener('mousemove', function() {g_rightForearmRot = this.value; renderShapes();});
    document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalXAngle = this.value; renderShapes(); });
    document.addEventListener("click", function (event) {
      if (event.shiftKey) {g_blink=g_blink * -1;}});
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
  requestAnimationFrame(tick);
}

var g_shapesList = [];

//  var g_points = [];  // The array for the position of a mouse press
//  var g_colors = [];  // The array to store the color of a point
//  var g_sizes = [];

function click(ev) {
  let [x,y] = conversion(ev);
  g_globalAngle = y * 100;
  g_globalXAngle = x * 100;
  renderShapes();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  console.log(g_seconds);
  renderShapes();
  requestAnimationFrame(tick);
}

function renderShapes() {
  var startTime = performance.now();
  // Clear <canvas>
  var globalRotMat = new Matrix4().rotate(g_globalXAngle,0,1,0);
  globalRotMat = globalRotMat.rotate(g_globalAngle,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draw cube
  var body = new Cube();
  body.color = [.55,.55,1,1];
  body.matrix.rotate(-20,1,0,0);
  body.matrix.scale(.75, .5, .5);
  body.matrix.translate(-.5,-.5,-.25);
  if (g_armSwingAnim) {
    body.matrix.translate(0, .1*Math.sin(g_seconds), 0);
  }
  var bodyCoords = new Matrix4(body.matrix);
  var eyeBodyCoords = new Matrix4(body.matrix);
  body.render();

  var eyeCover = new Cube();
  eyeCover.matrix = eyeBodyCoords;
  eyeCover.color = [.45,.45,1,1];
  eyeCover.matrix.scale(.8, .1, .3);
  eyeCover.matrix.translate(.126,8.1,-.76);
  if (g_blink === 1) {
    eyeCover.matrix.scale(1, -Math.abs(6*Math.sin(g_seconds)), 1);
  }
  eyeCover.render();

  var topEyelid = new Cube();
  topEyelid.matrix = bodyCoords;
  topEyelid.color = [.45,.45,1,1];
  topEyelid.matrix.scale(.8, .1, .3);
  topEyelid.matrix.translate(.125,8,-.75);
  topEyelid.render();

  var botEyelid = new Cube();
  botEyelid.matrix = bodyCoords;
  botEyelid.color = [.45,.45,1,1];
  botEyelid.matrix.translate(0,-6,0);
  botEyelid.render();

  var sideEyeRight = new Cube();
  sideEyeRight.matrix = bodyCoords;
  sideEyeRight.color = [.45,.45,1,1];
  sideEyeRight.matrix.scale(.1,7,1);
  sideEyeRight.matrix.translate(-.2,0,0);
  sideEyeRight.render();

  var sideEyeLeft = new Cube();
  sideEyeLeft.matrix = bodyCoords;
  sideEyeLeft.color = [.45,.45,1,1];
  sideEyeLeft.matrix.scale(1, 1, 1);
  sideEyeRight.matrix.translate(9.5,0,0);
  sideEyeLeft.render();

  var eyeball = new Cube();
  eyeball.matrix = bodyCoords;
  eyeball.color = [.9,.9,.9,1];
  eyeball.matrix.scale(9, .9, 1);
  eyeball.matrix.translate(-1,.1,.25);
  var eyeballCoords = new Matrix4(eyeball.matrix);
  eyeball.render(); 

  var iris = new Cube();
  iris.matrix = eyeballCoords;
  iris.color = [0,0,0,1];
  iris.matrix.scale(.5, .5, .5);
  iris.matrix.translate(.55,.55,-.25);
  iris.render();

  //draw leftShoulder
  var leftShoulder = new Cube();
  leftShoulder.matrix = bodyCoords;
  leftShoulder.color = [.3,.3,1,1];
  leftShoulder.matrix.scale(1, .5, 1);
  leftShoulder.matrix.translate(.5,.5,1.5);
  var leftShoulderCoords = new Matrix4(leftShoulder.matrix);
  leftShoulder.render();

  //draw leftArm
  var leftArm = new Cube();
  leftArm.matrix = leftShoulderCoords;
  leftArm.color = [.6,.6,1,1];
  leftArm.matrix.scale(.8, 2.5, 4);
  if (g_armSwingAnim) {
    leftArm.matrix.rotate(45*Math.sin(g_seconds), 1, 0, 0);
  } else {
    leftArm.matrix.rotate(g_leftArmRot, 1, 0, 0);
  }
  leftArm.matrix.translate(1,-.3,-.5);
  var leftArmCoords = new Matrix4(leftArm.matrix);
  leftArm.render();

  //draw leftElbow
  var leftElbow = new Cube();
  leftElbow.matrix = leftArmCoords;
  leftElbow.color = [.3,.3,1,1];
  leftElbow.matrix.scale(0.5, .8, .25);
  leftElbow.matrix.translate(.5,-1,1.5);
  var leftElbowCoords = new Matrix4(leftElbow.matrix);
  leftElbow.render();

  //draw leftForearm
  var leftForearm = new Cube();
  leftForearm.matrix = leftElbowCoords;
  leftForearm.color = [.6,.6,1,1];
  leftForearm.matrix.translate(-.75,.5,1.5);
  leftForearm.matrix.scale(2.5,1,5);
  leftForearm.matrix.rotate(180, 1, 0, 0);
  if (g_armSwingAnim) {
    leftForearm.matrix.rotate(45*Math.sin(g_seconds), 1, 0, 0);
  } else {
    leftForearm.matrix.rotate(g_leftForearmRot, 1, 0, 0);
  }
  leftForearm.render();

  //draw rightShoulder
  var rightShoulder = new Cube();
  rightShoulder.matrix = bodyCoords;
  rightShoulder.color = [.3,.3,1,1];
  rightShoulder.matrix.scale(1, 1, 1);
  rightShoulder.matrix.translate(-1.45,0,0);
  var rightShoulderCoords = new Matrix4(rightShoulder.matrix);
  rightShoulder.render();

  //draw rightArm
  var rightArm = new Cube();
  rightArm.matrix = rightShoulderCoords;
  rightArm.color = [.6,.6,1,1];
  rightArm.matrix.scale(.8, 2.5, 4);
  if (g_armSwingAnim) {
    rightArm.matrix.rotate(-45*Math.sin(g_seconds),1,0,0);
  } else {
    rightArm.matrix.rotate(g_rightArmRot,1,0,0);
  }
  rightArm.matrix.translate(-.1,-.3,-.5);
  var rightArmCoords = new Matrix4(rightArm.matrix);
  rightArm.render();

  //draw rightElbow
  var rightElbow = new Cube();
  rightElbow.matrix = rightArmCoords;
  rightElbow.color = [.3,.3,1,1];
  rightElbow.matrix.scale(.5, .8, .25);
  rightElbow.matrix.translate(.5,-1,1.5);
  var rightElbowCoords = new Matrix4(rightElbow.matrix);
  rightElbow.render();

  //draw rightForearm
  var rightForearm = new Cube();
  rightForearm.matrix = rightElbowCoords;
  rightForearm.color = [.6,.6,1,1];
  rightForearm.matrix.translate(-.75,.5,1.5);
  rightForearm.matrix.scale(2.5, 1, 5);
  rightForearm.matrix.rotate(180,1,0,0);
  if (g_armSwingAnim) {
    rightForearm.matrix.rotate(-45*Math.sin(g_seconds),1,0,0);
  } else {
    rightForearm.matrix.rotate(g_rightForearmRot,1,0,0);
  }
  rightForearm.render();


  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
