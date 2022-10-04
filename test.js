class InputManager {
    
    constructor(){
        this.keysDown = new Map();
        this.keysUp = new Map();
        this.keyDownEvents = [];
        this.keyUpEvents = [];
    }

    onUpdate(){
        for(let i = 0; i < this.keyDownEvents.length; i++){
            this.keysDown.set(this.keyDownEvents[i], true);
        }
        this.keyDownEvents = [];
        for(let i = 0; i < this.keyUpEvents.length; i++){
            this.keysDown.set(this.keyUpEvents[i], false);
        }
        this.keyUpEvents = [];
    }

    isKeyDown(key){
        return this.keysDown.get(key);
    }


    keyPressHandler(event){
        this.keyDownEvents.push(event.key);
    }

    keyUpHandler(event){
        this.keyUpEvents.push(event.key);
    }
}

class Time {
    constructor(){
        this.deltaTime = 0;
        this.lastTime = Date.now();
    }
    
    update(){
        this.deltaTime = (Date.now() - this.lastTime)/1000;
        this.lastTime = Date.now();
    }
}

var drawtimer;
var updatetimer;
var drawfps = 120;
var updatefps = 60;
var input = new InputManager();
var time = new Time();


var core = {
}

var sprites ={
    axe1 : {url:'Sprites/axe.png', destination: new Vector2(20,0), depth: 2, scale: new Vector2(1,2)},
            axe2 : {url:'Sprites/axe2.png', destination: new Vector2(30,45), depth: 1},
            axe3 : {url:'Sprites/upg_axe.png', destination: new Vector2(40,140), depth: 5}
}

function loaded() {


    var myCanvas = document.getElementById('glCanvas');
    var gl = myCanvas.getContext('webgl', {alpha:false});
    core.gl = gl;

    if(gl) {
        //var spriteBatch = new SpriteBatch(gl);
        SpriteBatch.init(gl);


        SpriteBatch.loadSprites( [sprites.axe1,sprites.axe2,sprites.axe3], function() { initialize(); });

        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

    } else {
        //context not supported
    }
   
}


function initialize(){
    console.log(input);
    document.addEventListener("keypress",function(event){input.keyPressHandler(event);});
    document.addEventListener("keyup", function(event){input.keyUpHandler(event);})
    startLoop();
}

function startLoop(){
    var dms = getMs(drawfps);
    var ums = getMs(updatefps);
    drawloop();
    updateloop();
    drawtimer = setInterval(drawloop, dms);
    updatetimer = setInterval(updateloop, ums);
}

function drawloop() {
    
    core.gl.clear(core.gl.COLOR_BUFFER_BIT);

    //draw sprites
    SpriteBatch.begin(SpriteSortMode.BackToFront,core.gl.FUNC_ADD);
    //SpriteBatch.begin(SpriteSortMode.FrontToBack,gl.FUNC_ADD);
    //SpriteBatch.begin(SpriteSortMode.Deferred,gl.FUNC_ADD)
    SpriteBatch.draw(sprites.axe1);
    SpriteBatch.draw(sprites.axe2);
    SpriteBatch.draw(sprites.axe3);
    SpriteBatch.end();
}

function updateloop(){
    time.update();
    input.onUpdate();
    var x = 0;
    var y = 0;

    if (input.isKeyDown("a")){
        x-=1;
    }
    if (input.isKeyDown("d")){
        x +=1;
    }
    if (input.isKeyDown("w")){
        y-=1;
    }
    if (input.isKeyDown("s")){
        y +=1;
    }

    var speed = 200 * time.deltaTime;
    var prevLoc = sprites.axe1.destination;
    prevLoc.x += x * speed;
    prevLoc.y += y * speed;
    
    sprites.axe1.destination = prevLoc;
}

var loc = 20;






function getMs(fps){
    return 1000/fps;
}
window.onload = loaded();