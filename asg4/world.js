// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;         //use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);  // use uv debug color
    } else if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); //Use normal
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // Use texture1
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // Use texture2
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV); // Use texture3
    } else {
      gl_FragColor = vec4(1,.2,.2,1);             //error, put red
    }
      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r = length(lightVector);
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      vec3 R = reflect(-L,N);

      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

      float specular = pow(max(dot(E,R), 0.0),50.0);
      
      vec3 diffuse = vec3(gl_FragColor) * nDotL *0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      if (u_lightOn) {
        if (u_whichTexture == -2) {
          gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse+ambient,1.0); 
        }
      }
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }


  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  var image = new Image();
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  if (!image || !image1 || !image2 || !image3) {
    console.log('Failed to create image object');
    return false;
  }

  image.onload = function(){ sendImageToTEXTURE0(image)};
  image.src = 'ground.jpg';
  image1.onload = function() { sendImageToTEXTURE1(image1); };
  image1.src = 'sky.jpg';
  image2.onload = function() { sendImageToTEXTURE2(image2); };
  image2.src = 'wood.jpg';
  image3.onload = function() { sendImageToTEXTURE3(image3); };
  image3.src = 'leaves.jpg';
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object.');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture')
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object.');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);  // Bind texture to sampler1
}

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object.');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);  // Bind texture to sampler1
}

function sendImageToTEXTURE3(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object.');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);  // Bind texture to sampler1
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
let g_normalOn = false;
let g_lightPos = [0,1,-2];
let g_lightOn = true;

function addActionsForHtmlUI() {
  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };
  document.getElementById('AnimOn').onclick = function() { g_armSwingAnim = true; };
  document.getElementById('AnimOff').onclick = function() { g_armSwingAnim = false; };
  document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalXAngle = this.value; renderShapes(); });
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderShapes();}});


  document.addEventListener("click", function (event) {
    if (event.shiftKey) {g_blink=g_blink * -1;}});
}

function main() {
  setupWebGL();
  connectVarGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = () => canvas.requestPointerLock();
  document.addEventListener("mousemove", mouseLook, false);

  document.onkeydown = keydown;
  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  requestAnimationFrame(tick);
}

var g_shapesList = [];

//  var g_points = [];  // The array for the position of a mouse press
//  var g_colors = [];  // The array to store the color of a point
//  var g_sizes = [];

function mouseLook(event) {
  if (document.pointerLockElement !== canvas) return;
  const sensitivity = 0.005;
  let lr = -event.movementX * sensitivity; // Left/right rotation
  let ud = -event.movementY * sensitivity; // Up/down rotation
  g_camera.lr(lr);
  g_camera.ud(ud);
  renderShapes();
}

function keydown(ev) {
  if (ev.keyCode==68) { //D
    g_camera.moveRight();
  } else if (ev.keyCode == 65) { //A
    g_camera.moveLeft();
  } else if (ev.keyCode == 87) { //W
    g_camera.moveForward();
  } else if (ev.keyCode == 83) { //S
    g_camera.moveBackwards();
  } else if (ev.keyCode == 81) { //Q
    g_camera.panLeft();
  } else if (ev.keyCode == 69) { //E
    g_camera.panRight();
  } else if (ev.keyCode == 82) { // R - Move Up
    g_camera.moveUp();
  } else if (ev.keyCode == 70) { // F - Move Down
    g_camera.moveDown();
  }
  renderShapes();
  console.log(ev.keyCode);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  g_lightPos[0] = Math.cos(g_seconds);
}

//var g_eye=[0,0,3];
let g_camera = new Camera();
//rotate
//atp = direction = at-eye;
//r = sqrt((d.cross(d,x)^2+(d.cross(d,y)^2)))
//theta = arctan(y,x); keep in mind arctan is in rads
//theta = theta + 5deg;
//newx = r * cos(theta)
//newy = r * sin(theta)
//d=(newx,newy);
//at = eye+d;

//let g_map = [
//  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
//  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2],
//  [2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2],
//  [2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2],
//  [2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,1,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,3,3,4,1,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,3,3,3,4,4,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,3,3,3,4,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,1,1,1,1,1,2],
//  [2,1,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,0,0,0,0,1,1,1,1,2],
//  [2,1,0,0,0,0,-1,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,0,0,0,0,0,0,0,0,0,1,1,1,1,2],
//  [2,1,0,0,0,0,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,0,0,0,-1,-1,0,0,0,1,1,1,1,2],
//  [2,1,1,0,0,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-2,-2,-1,0,0,0,0,1,1,2],
//  [2,1,1,1,0,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,0,0,0,0,1,1,2],
//  [2,1,1,1,0,0,-1,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,0,0,0,0,1,2],
//  [2,1,1,1,0,0,0,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,0,0,0,0,1,2],
//  [2,1,1,1,1,0,0,-1,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,-1,0,0,1,1,1,2],
//  [2,1,1,1,1,1,1,0,-1,-1,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-1,0,0,0,0,1,1,1,2],
//  [2,1,1,1,1,1,1,1,0,-1,-1,-1,-2,-2,-2,-2,-2,-2,-1,-1,-1,-1,-1,0,0,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,1,0,0,0,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,2],
//  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
//  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
//];
//
//function drawMap() {
//  for (let x = 0; x < 32; x++) {
//    for (let y = 0; y < 32; y++) {
//      let height = g_map[x][y];
//      if (height > 0 && height < 3) {
//        for (let h = 0; h < height; h++) {
//          var wall = new Cube();
//          wall.color = [0, 1.0, 1.0, 1.0];
//          wall.textureNum = 0;
//          wall.matrix.translate(x - 16, h - 0.75, y - 16);
//          wall.renderFaster();
//        }
//      } else if (height == -1) {
//        var wall = new Cube();
//        wall.color = [.4, .4, .4, 1.0];
//        wall.textureNum = -2;
//        wall.matrix.translate(x - 16, -1.5, y - 16);
//        wall.renderFaster();
//      } else if (height == -2) {
//        var wall = new Cube();
//        wall.color = [.6, .8, .9, 1];
//        wall.textureNum = -2;
//        wall.matrix.translate(x - 16, -1.7, y - 16);
//        wall.renderFaster();
//      } else if (height == 3) {
//        for (let h = 0; h < height; h++) {
//          var wall = new Cube();
//          wall.color = [.6, .8, .9, 1];
//          wall.textureNum = 2;
//          wall.matrix.translate(x - 16, h - 0.75, y - 16);
//          wall.renderFaster();
//          var wall = new Cube();
//          wall.color = [.6, .8, .9, 1];
//          wall.textureNum = 3;
//          wall.matrix.translate(x - 16, h + 2.25, y - 16);
//          wall.renderFaster();
//        }
//      } else if (height == 4) {
//        for (let h = 0; h < 2; h++) {
//          var wall = new Cube();
//          wall.color = [.6, .8, .9, 1];
//          wall.textureNum = 3;
//          wall.matrix.translate(x - 16, h + 2.25, y - 16);
//          wall.renderFaster();
//        }
//      }
//      
//    }
//  }
//}

function drawAnimal(x,y,z) {
  //draw cube
  var body = new Cube();
  body.textureNum=-2;
  body.color = [.55,.55,1,1];
  if (g_normalOn) body.textureNum=-3;
  body.matrix.rotate(180, 0, 1, 0);
  body.matrix.scale(.75, .5, .5);
  body.matrix.translate(x-(-.5),y-(1.5),z-(-.25));
  if (g_armSwingAnim) {
    body.matrix.translate(0, .1*Math.sin(g_seconds), 0);
  }
  var bodyCoords = new Matrix4(body.matrix);
  var eyeBodyCoords = new Matrix4(body.matrix);
  body.render();

  var eyeCover = new Cube();
  eyeCover.matrix = eyeBodyCoords;
  eyeCover.color = [.45,.45,1,1];
  if (g_normalOn) eyeCover.textureNum=-3;
  eyeCover.matrix.scale(.8, .1, .3);
  eyeCover.matrix.translate(.126,8.1,-.76);
  if (g_blink === 1) {
    eyeCover.matrix.scale(1, -Math.abs(6*Math.sin(g_seconds)), 1);
  }
  eyeCover.render();

  var topEyelid = new Cube();
  topEyelid.matrix = bodyCoords;
  topEyelid.color = [.45,.45,1,1];
  if (g_normalOn) topEyelid.textureNum=-3;
  topEyelid.matrix.scale(.8, .1, .3);
  topEyelid.matrix.translate(.125,8,-.75);
  topEyelid.render();

  var botEyelid = new Cube();
  botEyelid.matrix = bodyCoords;
  botEyelid.color = [.45,.45,1,1];
  if (g_normalOn) botEyelid.textureNum=-3;
  botEyelid.matrix.translate(0,-6,0);
  botEyelid.render();

  var sideEyeRight = new Cube();
  sideEyeRight.matrix = bodyCoords;
  sideEyeRight.color = [.45,.45,1,1];
  if (g_normalOn) sideEyeRight.textureNum=-3;
  sideEyeRight.matrix.scale(.1,7,1);
  sideEyeRight.matrix.translate(-.2,0,0);
  sideEyeRight.render();

  var sideEyeLeft = new Cube();
  sideEyeLeft.matrix = bodyCoords;
  sideEyeLeft.color = [.45,.45,1,1];
  if (g_normalOn) sideEyeLeft.textureNum=-3;
  sideEyeLeft.matrix.scale(1, 1, 1);
  sideEyeRight.matrix.translate(9.5,0,0);
  sideEyeLeft.render();

  var eyeball = new Cube();
  eyeball.matrix = bodyCoords;
  eyeball.color = [.9,.9,.9,1];
  if (g_normalOn) eyeball.textureNum=-3;
  eyeball.matrix.scale(9, .9, 1);
  eyeball.matrix.translate(-1,.1,.25);
  var eyeballCoords = new Matrix4(eyeball.matrix);
  eyeball.render(); 

  var iris = new Cube();
  iris.matrix = eyeballCoords;
  iris.color = [0,0,0,1];
  if (g_normalOn) iris.textureNum=-3;
  iris.matrix.scale(.5, .5, .5);
  iris.matrix.translate(.55,.55,-.25);
  iris.render();

  //draw leftShoulder
  var leftShoulder = new Cube();
  leftShoulder.matrix = bodyCoords;
  leftShoulder.color = [.3,.3,1,1];
  if (g_normalOn) leftShoulder.textureNum=-3;
  leftShoulder.matrix.scale(1, .5, 1);
  leftShoulder.matrix.translate(.5,.5,1.5);
  var leftShoulderCoords = new Matrix4(leftShoulder.matrix);
  leftShoulder.render();

  //draw leftArm
  var leftArm = new Cube();
  leftArm.matrix = leftShoulderCoords;
  leftArm.color = [.6,.6,1,1];
  if (g_normalOn) leftArm.textureNum=-3;
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
  if (g_normalOn) leftElbow.textureNum=-3;
  leftElbow.matrix.scale(0.5, .8, .25);
  leftElbow.matrix.translate(.5,-1,1.5);
  var leftElbowCoords = new Matrix4(leftElbow.matrix);
  leftElbow.render();

  //draw leftForearm
  var leftForearm = new Cube();
  leftForearm.matrix = leftElbowCoords;
  leftForearm.color = [.6,.6,1,1];
  if (g_normalOn) leftForearm.textureNum=-3;
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
  if (g_normalOn) rightShoulder.textureNum=-3;
  rightShoulder.matrix.scale(1, 1, 1);
  rightShoulder.matrix.translate(-1.45,0,0);
  var rightShoulderCoords = new Matrix4(rightShoulder.matrix);
  rightShoulder.render();

  //draw rightArm
  var rightArm = new Cube();
  rightArm.matrix = rightShoulderCoords;
  rightArm.color = [.6,.6,1,1];
  if (g_normalOn) rightArm.textureNum=-3;
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
  if (g_normalOn) rightElbow.textureNum=-3;
  rightElbow.matrix.scale(.5, .8, .25);
  rightElbow.matrix.translate(.5,-1,1.5);
  var rightElbowCoords = new Matrix4(rightElbow.matrix);
  rightElbow.render();

  //draw rightForearm
  var rightForearm = new Cube();
  rightForearm.matrix = rightElbowCoords;
  rightForearm.color = [.6,.6,1,1];
  if (g_normalOn) rightForearm.textureNum=-3;
  rightForearm.matrix.translate(-.75,.5,1.5);
  rightForearm.matrix.scale(2.5, 1, 5);
  rightForearm.matrix.rotate(180,1,0,0);
  if (g_armSwingAnim) {
    rightForearm.matrix.rotate(-45*Math.sin(g_seconds),1,0,0);
  } else {
    rightForearm.matrix.rotate(g_rightForearmRot,1,0,0);
  }
  rightForearm.render();
}

function renderShapes() {
  var startTime = performance.now();
  // Clear <canvas>
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  var globalRotMat = new Matrix4().rotate(g_globalXAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //floor
  //var floor = new Cube();
  //floor.color = [0.0,0.7,0.3,1.0];
  //floor.textureNum=-2;
  //if (g_normalOn) floor.textureNum=-3;
  //floor.matrix.translate(0,-.75,0.0);
  //floor.matrix.scale(32,0,32);
  //floor.matrix.translate(-.5,0,-0.5);
  //floor.render();

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  var sphere = new Sphere();
  sphere.color = [1.0,1.0,1.0,1.0];
  sphere.textureNum=-2;
  if (g_normalOn) sphere.textureNum=-3;
  sphere.matrix.scale(.5,.5,.5);
  sphere.render();

  //go sky
  var sky = new Cube();
  sky.color = [0.0,0.0,1.0,1.0];
  sky.textureNum=1;
  if (g_normalOn) sky.textureNum=-3;
  sky.matrix.scale(-5,-5,-5);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.render();

  //draw cube
  //var body = new Cube();
  //body.color = [.55,.55,1,1];
  //body.textureNum=0;
  //body.matrix.rotate(-20,1,0,0);
  //body.matrix.scale(.75, .5, .5);
  //body.matrix.translate(-.5,-.5,-.25);
  //body.renderFaster();

  drawAnimal(0,0,0);
  //drawMap();

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
