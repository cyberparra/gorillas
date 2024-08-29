// The state of the game
let state = {};
// ...

var playShootBomb = document.getElementById("shootBomb");
var playHitGorilla = document.getElementById("hitGorilla");
var playMissGorilla = document.getElementById("missGorilla");  

// References to HTML elements
const canvas = document.getElementById("game");
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
const ctx = canvas.getContext("2d"); 


//center info panel
const shoot1DOM = document.querySelector("#info-center .shoot");

// Left info panel
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");


// Right info panel
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");


// Congratulations panel
const congratulationsDOM = document.getElementById("congratulations");
const winnerDOM = document.getElementById("winner");
const newGameButtonDOM = document.getElementById("new-game");
newGameButtonDOM.addEventListener("click", newGame);


// The bomb's grab area 
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");

let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;
let shootCounter=0;

bombGrabAreaDOM.addEventListener("mousedown", function (e) {
  if (state.phase === "aiming") {
    isDragging = true;
    

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    document.body.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", function (e) {
  if (isDragging) {
    let deltaX = e.clientX - dragStartX;
    let deltaY = e.clientY - dragStartY;

    state.bomb.velocity.x = -deltaX;
    state.bomb.velocity.y = +deltaY;
    setInfo(deltaX, deltaY);

    draw();
  }
});

window.addEventListener("mouseup", function () {
  if (isDragging) {
    isDragging = false;
    

    document.body.style.cursor = "default";

    throwBomb();
  }
});

function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angleInRadians = Math.asin(deltaY / hypotenuse);
  const angleInDegrees = (angleInRadians / Math.PI) * 180;

  if (state.currentPlayer === 1) {
    angle1DOM.innerText = Math.round(angleInDegrees);
    velocity1DOM.innerText = Math.round(hypotenuse);
    shoot1DOM.innerText = shootCounter;
  } else {
    angle2DOM.innerText = Math.round(angleInDegrees);
    velocity2DOM.innerText = Math.round(hypotenuse);
    
   
  }
}

newGame();

function newGame() {
  // Initialize game state
  shootCounter=0;
  state = {
    scale:1,
    phase:"aiming", //aiming | in flight | celebrating
    currentPlayer:1,
    
    bomb:{
        x:undefined,
        y:undefined,
        velocity:{x:0,y:0},
    
    },
    buildings: generateBuildings(),
  };

  // ...


calculateScale();
initializeBombPosition();

// Reset HTML elements
congratulationsDOM.style.visibility = "hidden";
angle1DOM.innerText = 0;
velocity1DOM.innerText = 0;
angle2DOM.innerText = 0;
velocity2DOM.innerText = 0;
shoot1DOM.innerText=0;
shootCounter=0;




draw();
}

function calculateScale() {
  const lastBuilding = state.buildings.at(-1);
  const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;

  state.scale = window.innerWidth / totalWidthOfTheCity;
}

function draw() {
  // ...
  ctx.save(); 
  // Flip coordinate system upside down 
  ctx.translate(0, window.innerHeight); 
  ctx.scale(1, -1);
  ctx.scale(state.scale, state.scale); 

  // Draw scene 
  drawBackground(); 
  drawBuildings();
  drawGorilla(1);
  drawGorilla(2);
  drawBomb(); 

  // Restore transformation 
  ctx.restore(); 
}

// Event handlers
// ...


function generateBuildings() {
    const buildings = [];
  for (let index = 0; index < 8; index++) {
    const previousBuilding = buildings[index - 1];

    const x = previousBuilding
      ? previousBuilding.x + previousBuilding.width + 4
      : 0;

    const minWidth = 80;
    const maxWidth = 130;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const platformWithGorilla = index === 1 || index === 6;

    const minHeight = 40;
    const maxHeight = 300;
    const minHeightGorilla = 30;
    const maxHeightGorilla = 150;

    const height = platformWithGorilla
      ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
      : minHeight + Math.random() * (maxHeight - minHeight);

    buildings.push({ x, width, height });
  }
  return buildings;
  }
  
function initializeBombPosition() {
  const building =
    state.currentPlayer === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;

  const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
  const gorillaHandOffsetY = 107;

  state.bomb.x = gorillaX + gorillaHandOffsetX;
  state.bomb.y = gorillaY + gorillaHandOffsetY;
  state.bomb.velocity.x = 0;
  state.bomb.velocity.y = 0;

   // Initialize the position of the grab area in HTML
   const grabAreaRadius = 15;
   const left = state.bomb.x * state.scale - grabAreaRadius;
   const bottom = state.bomb.y * state.scale - grabAreaRadius;
   bombGrabAreaDOM.style.left = `${left}px`;
   bombGrabAreaDOM.style.bottom = `${bottom}px`;
  }

function drawBackground() {
  const gradient=ctx.createLinearGradient(0,0,0,window.innerHeight);
  gradient.addColorStop(1,"#fb8500");
  gradient.addColorStop(0,"#ffc28e");

  //draw sky

  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,window.innerWidth, window.innerHeight);


  /* ctx.fillStyle = "#58A8D8";
  ctx.fillRect(
    0,
    0,
    window.innerWidth / state.scale,
    window.innerHeight / state.scale
  ); */
  }
  
  function drawBuildings() {
    state.buildings.forEach((building) => {
      ctx.fillStyle = "#4a3c68";
      ctx.fillRect(building.x, 0, building.width, building.height);
    });
  }
  
function drawGorilla(player) {
  ctx.save();
  const building =
    player === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  ctx.translate(building.x + building.width / 2, building.height);

  drawGorillaBody();
  drawGorillaLeftArm(player);
  drawGorillaRightArm(player);
  drawGorillaFace();

  ctx.restore();
  }
  
function drawGorillaBody() {
  
  
  ctx.fillStyle = "black";
  ctx.beginPath(); 

  // Starting Position
  ctx.moveTo(0, 15); 

  // Left Leg
  ctx.lineTo(-7, 0);
  ctx.lineTo(-20, 0); 

  // Main Body
  ctx.lineTo(-13, 77);
  ctx.lineTo(0, 84);
  ctx.lineTo(13, 77); 

  // Right Leg
  ctx.lineTo(20, 0);
  ctx.lineTo(7, 0);

  ctx.fill();
  }
  
function drawGorillaLeftArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(-13, 50);

  if (
    (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
  ) {
    ctx.quadraticCurveTo(-44, 63, -28, 107);
  } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12);
  }

  ctx.stroke();
  }
  
function drawGorillaRightArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(+13, 50);

  if (
    (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
  ) {
    ctx.quadraticCurveTo(+44, 63, +28, 107);
  } else {
    ctx.quadraticCurveTo(+44, 45, +28, 12);
  }

  ctx.stroke();
  }
  
function drawGorillaFace() {

  //face
  //ctx.strokeStyle="lightgray";
  ctx.fillStyle="lightgray";
  ctx.beginPath();
  ctx.arc(0,63,7,0,2*Math.PI);
  ctx.moveTo(-3,69);
  ctx.arc(-3,69,4,0,2*Math.PI);
  ctx.moveTo(3,69);
  ctx.arc(3,69,4,0,2*Math.PI);
  ctx.fill();

//eyes
  ctx.fillStyle="black";
  ctx.beginPath();
  ctx.arc(-3,69,1.5,0,2*Math.PI);
  ctx.moveTo(3,69);
  ctx.arc(3,69,1.5,0,2*Math.PI);
  ctx.fill();

//mouth


ctx.beginPath();

ctx.arc(-0.5,60,4,0,Math.PI,false);
ctx.fill();
  }


function drawBomb() {
  // Draw throwing trajectory
  if (state.phase === "aiming") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(state.bomb.x, state.bomb.y);
    ctx.lineTo(
      state.bomb.x + state.bomb.velocity.x,
      state.bomb.y + state.bomb.velocity.y
    );
    ctx.stroke();
  }

  // Draw circle
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(state.bomb.x, state.bomb.y, 6, 0, 2 * Math.PI);
  ctx.fill();
  }

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calculateScale();
    initializeBombPosition();
    draw();
  });

  let previousAnimationTimestamp = undefined; 

function throwBomb() {
  
  state.phase = "in flight";
  playShootBomb.play(); 

  if(state.currentPlayer===1){
    shootCounter++ 
    shoot1DOM.innerText=shootCounter

  }
 
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (!previousAnimationTimestamp) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }

  const elapsedTime = timestamp - previousAnimationTimestamp;

  const hitDetectionPrecision = 10;
  for (let i = 0; i < hitDetectionPrecision; i++) {
    moveBomb(elapsedTime / hitDetectionPrecision); // Hit detection

    const miss = checkFrameHit() || checkBuildingHit();
    const hit = checkGorillaHit();

    // Handle the case when we hit a building or the bomb got off-screen
    if (miss) {
      playMissGorilla.play(); 
      state.currentPlayer = state.currentPlayer === 1 ? 2 : 1; // Switch players
      state.phase = "aiming";
      initializeBombPosition();
      draw();
      return;
    }

    // Handle the case when we hit the enemy
    if (hit) {
      playHitGorilla.play(); 
      state.phase = "celebrating";
      announceWinner();
      draw();
      return;
    }
  }

  draw();

  // Continue the animation loop
  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(animate);
}


  function moveBomb(elapsedTime) {
    const multiplier = elapsedTime / 200; // Adjust trajectory by gravity
  
    state.bomb.velocity.y -= 20 * multiplier; // Calculate new position
  
    state.bomb.x += state.bomb.velocity.x * multiplier;
    state.bomb.y += state.bomb.velocity.y * multiplier;
  }

  function checkFrameHit() {
    if (
      state.bomb.y < 0 ||
      state.bomb.x < 0 ||
      state.bomb.x > window.innerWidth / state.scale
    ) {
      return true; // The bomb is off-screen
    }
  }
  
  function checkBuildingHit() {
    for (let i = 0; i < state.buildings.length; i++) {
      const building = state.buildings[i];
      if (
        state.bomb.x + 4 > building.x &&
        state.bomb.x - 4 < building.x + building.width &&
        state.bomb.y - 4 < 0 + building.height
      ) {
        return true; // Building hit
      }
    }
  }
  
  function checkGorillaHit() {
    const enemyPlayer = state.currentPlayer === 1 ? 2 : 1;
    const enemyBuilding =
      enemyPlayer === 1
        ? state.buildings.at(1) // Second building
        : state.buildings.at(-2); // Second last building
  
    ctx.save();
  
    ctx.translate(
      enemyBuilding.x + enemyBuilding.width / 2,
      enemyBuilding.height
    );
  
    drawGorillaBody();
    let hit = ctx.isPointInPath(state.bomb.x, state.bomb.y);
  
    drawGorillaLeftArm(enemyPlayer);
    hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);
  
    drawGorillaRightArm(enemyPlayer);
    hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);
  
    ctx.restore();
  
    return hit;
  }

  function announceWinner() { 
    winnerDOM.innerText = `Player ${state.currentPlayer}`;
    congratulationsDOM.style.visibility = "visible";
}


//mute-unmute sound

function toggleMute() {
  var audioElement = document.getElementById('shootBomb'); // Replace 'myAudio' with the id of your audio element
  if (audioElement.muted) {
    audioElement.muted = false; // Unmute the audio
  } else {
    audioElement.muted = true; // Mute the audio
  }
}

const toggleButton = document.getElementById('toggleButton');
        const toggleText = document.getElementById('toggleText');

        toggleButton.addEventListener('click', () => {
            toggleText.classList.toggle('hidden');
            toggleButton.textContent = toggleText.classList.contains('hidden') ? 'H2Play' : 'Hide Text';
        });