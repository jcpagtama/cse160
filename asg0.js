// DrawRectangle.js
function main() {
  // Retrieve <canvas> element                                  <- (1)
   var canvas = document.getElementById('example');
   if (!canvas) {
     console.log('Failed to retrieve the <canvas> element');
     return;
   }
  // Get the rendering context for 2DCG                          <- (2)
  var ctx = canvas.getContext('2d');
  // Draw a blue rectangle                                       <- (3)
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

function drawVector(v, color) {   //takes in vector3 object and color string
  const canvas = document.getElementById("example");  //find canvas
  const ctx = canvas.getContext("2d");
  originX = canvas.width/2;     //get canvas x origin
  originY = canvas.height/2;    //get canvas y oriign
  ctx.strokeStyle = color;      //set line color
  ctx.beginPath();              //draw line
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + (v.elements[0] * 20), originY - (v.elements[1] * 20));
  ctx.stroke();
}

function handleDrawEvent() {
  const canvas = document.getElementById("example");  //find canvas
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
  v1x = document.getElementById("v1x").value;
  v1y = document.getElementById("v1y").value;
  v2x = document.getElementById("v2x").value;
  v2y = document.getElementById("v2y").value;
  v1 = new Vector3([v1x, v1y, 0]);
  v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  const canvas = document.getElementById("example");  //find canvas
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
  v1x = document.getElementById("v1x").value;
  v1y = document.getElementById("v1y").value;
  v2x = document.getElementById("v2x").value;
  v2y = document.getElementById("v2y").value;
  v1 = new Vector3([v1x, v1y, 0]);
  v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
  v3 = v1;
  v4 = v2;
  op = document.getElementById("operation-select").value;
  scalar = document.getElementById("scalar").value;
  if (op == "Addition") {   //Adds v2 to v1 and draws resultant vector
    v3.add(v2);
    drawVector(v3, "green");
  } else if (op == "Subtraction") {   //Subtracts v2 from v1 and draws resultant vector
    v3.sub(v2);
    drawVector(v3, "green");
  } else if (op == "Multiplication") {    //Multiplies vectors by scalar val
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op == "Division") {    //Divides vectors by scalar val
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op == "Magnitude") {   //Finds magnitude of both vectors
    console.log(v1.magnitude());
    console.log(v2.magnitude());
  } else if (op == "Normalize") {   //Normalizes vectors and draws them
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op == "Angle Between") {   //calculates angle between 2 vectors
    let d = Vector3.dot(v1, v2);
    let bot = v1.magnitude() * v2.magnitude();
    console.log((Math.acos((d/bot)) * (180/Math.PI)).toFixed());  //convert from rad to deg and remove floating point
  } else if (op == "Area") {   //calculates area of triangle created by 2 vectors
    console.log(Vector3.cross(v1, v2).magnitude()/2);
  }
}