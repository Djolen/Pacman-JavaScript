
const canvas = document.getElementById('field'); 
const ctx = canvas.getContext('2d');

canvas.width = '800'; 
canvas.height = '440';

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore')
const livesDisplay = document.getElementById('lives');
const pauseText = document.getElementById('pause')
const hitNotation = document.getElementById('hit')


let player;
let enemy;
let keys = [];
// maksimalni skor 8330
let score = 0;
let highScore = 0;


let isPaused = false;
let superPalletTimer;
let isSuperPalletTimer = false
let animationID;
const cellSize = 40; 
const pellets = [];
const superPellets = [];
const gameGrid = []; 
let ghosts = [];
let ghostScoreValue = 1; //parametar za vrednost duha u toku super palleta
/* izgled grida */
// 1 - horizontalni zid , 2 - pellet, l - donji levi, r - donji desni, ul - gornji levi, ur- gornji desni, left -leva str, right -desna str
// 4 - horizontalni zid ,s1 s2 s3 - specijalni 
const gameGridBluePrint = [
    ["ul",4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,"ur"],
    [1,0,2,2,2,2,2,2,2,1,1,2,2,2,2,3,2,2,2,1],
    [1,2,"left",4,4,4,4,"right",2,"l","r",2,"left",4,4,4,4,"right",2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,"u",2,"ul",4,4,"ur",2,"ul",4,4,"ur",2,"ul",4,4,"ur",2,1],
    [1,3,1,2,1 /* sporni */,0,0,1,2,1,0,0,1,2,1,0,0,1,2,1],
    [1,2,1,2,"l",4,4 /* sporni */,1,2,1,4,4,1,2,"s2","s3",0,1,2,1],
    [1,2,1,2,2,2,2,1 /* sporni */,2,1,0,0,1,2,"s1",0,0,1,3,1],
    [1,2,"d",2,2,2,2,"d",2,"l",4,4,"r",2,"l",4,4,"r",2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    ["l",4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,"r"],
];

/* GRID SPRITES */

const gridSprites = {
    vertical : new Image(),
    horizontal : new Image(),
    leftCorner : new Image(),
    rightCorner : new Image(),
    upLeft : new Image(),
    upRight : new Image(),
    down : new Image(),
    up : new Image(),
    left : new Image(),
    right : new Image(),
    spec1  : new Image(),
    spec2  : new Image(),
    spec3  : new Image(),
}

gridSprites.vertical.src = "sprites/gridSprite/vertical.png"
gridSprites.horizontal.src = "sprites/gridSprite/horizontal.png"
gridSprites.leftCorner.src = "sprites/gridSprite/leftcorner.png"
gridSprites.rightCorner.src = "sprites/gridSprite/rightcorner.png"
gridSprites.upLeft.src = "sprites/gridSprite/upleft.png"
gridSprites.upRight.src = "sprites/gridSprite/upright.png"
gridSprites.down.src = "sprites/gridSprite/down.png"
gridSprites.up.src = "sprites/gridSprite/up.png"
gridSprites.left.src = "sprites/gridSprite/left.png"
gridSprites.right.src = "sprites/gridSprite/right.png"
gridSprites.spec1.src = "sprites/gridSprite/spec1.png"
gridSprites.spec2.src = "sprites/gridSprite/spec2.png"
gridSprites.spec3.src = "sprites/gridSprite/spec3.png"

/* PACMAN SPRITES */

const pacmanSprites = {
    pacman : new Image(),
    pacmanR : new Image(),
    pacmanL : new Image(),
    pacmanU : new Image(),
    pacmanD : new Image(),
    pacmanInvulnerable : new Image(),
}

pacmanSprites.pacman.src = "sprites/pacman/pacman.png"
pacmanSprites.pacmanR.src = "sprites/pacman/pacmanR.png"
pacmanSprites.pacmanL.src = "sprites/pacman/pacmanL.png"
pacmanSprites.pacmanU.src = "sprites/pacman/pacmanU.png"
pacmanSprites.pacmanD.src = "sprites/pacman/pacmanD.png"
pacmanSprites.pacmanInvulnerable.src = "sprites/pacman/pacmanInvulnerable.png"

let imageSwap = 0; //parametar za "animaciju" usta pacmana

class Player{
    constructor(x,y,velocityX,velocityY){
        this.x = x; 
        this.y = y; 
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.radius = 15;
        this.lives = 3;
        //this.playerColor = "yellow"
        this.image = pacmanSprites.pacman
        this.pacman = pacmanSprites.pacman
        this.pacmanR = pacmanSprites.pacmanR
        this.pacmanL = pacmanSprites.pacmanL
        this.pacmanU = pacmanSprites.pacmanU
        this.pacmanD = pacmanSprites.pacmanD
        this.pacmanI = pacmanSprites.pacmanInvulnerable
        this.damagable = true;      
        this.superFeature = false; 
        this.superPauseFlag = false;
        this.lastDirection = null;
        this.directionLobby = null;
    } 

    draw(){
        /* ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.playerColor;
        ctx.fill();
        ctx.closePath(); */

        ctx.drawImage(this.image, this.x - 20, this.y - 20)
    }

    update(){
        //proverava se da li je poslednji pritisak na dugme bio neuspesan, i ako jeste prvom sledecom prilikom skrece
        if(player.directionLobby != null){       
            if(player.directionLobby == "w"){   
                let counter = 0
                for(let i = 0; i < gameGrid.length; i++){  //provera za svaki trenurak da li dolazi do kolizije na gore
                    let gridCell = gameGrid[i]      
                    if((playerCollidesWithWall(player,gridCell,0,-5)) == false)
                        counter ++
                    if((playerCollidesWithWall(player,gridCell,0,-5))){
                        //console.log("ima kolizije")
                        counter = 0  
                    }
                    if((playerCollidesWithWall(player,gridCell,0,-5)) == false && counter == gameGrid.length - 1){ //krece i izbacuje neuspesni pritisak iz "lobbya"
                        //console.log("nema kolizije")
                        if(player.directionLobby == "w"){
                            player.velocityY = -7;
                            player.velocityX =  0;
                            player.directionLobby = null
                        }  
                    } 
                }
            } 
            
            if(player.directionLobby == "s"){
                let counterS = 0;
                for(let i = 0; i < gameGrid.length; i++){
                    let gridCell = gameGrid[i]      
                    if((playerCollidesWithWall(player,gridCell,0, 5)) == false)
                        counterS ++
                    if((playerCollidesWithWall(player,gridCell,0, 5))){
                        //console.log("ima kolizije")
                        counterS = 0  
                    }
                    if((playerCollidesWithWall(player,gridCell,0, 5)) == false && counterS == gameGrid.length - 1){
                        //console.log("nema kolizije")
                        if(player.directionLobby == "s"){
                            player.velocityY =  7;
                            player.velocityX =  0;
                            player.directionLobby = null
                        }  
                    } 
                }
            }

            if(player.directionLobby == "a"){
                let counterA = 0;
                for(let i = 0; i < gameGrid.length; i++){
                    let gridCell = gameGrid[i]      
                    if((playerCollidesWithWall(player,gridCell,-5, 0)) == false)
                        counterA ++
                    if((playerCollidesWithWall(player,gridCell, -5, 0))){
                        //console.log("ima kolizije")
                        counterA = 0  
                    }
                    if((playerCollidesWithWall(player,gridCell,-5, 0)) == false && counterA == gameGrid.length - 1){
                        //console.log("nema kolizije")
                        if(player.directionLobby == "a"){
                            player.velocityY =  0;
                            player.velocityX =  -7;
                            player.directionLobby = null
                        }  
                    } 
                }
            }

            if(player.directionLobby == "d"){
                let counterD = 0;
                for(let i = 0; i < gameGrid.length; i++){
                    let gridCell = gameGrid[i]      
                    if((playerCollidesWithWall(player,gridCell, 5, 0)) == false)
                        counterD ++
                    if((playerCollidesWithWall(player,gridCell, 5, 0))){
                        //console.log("ima kolizije")
                        counterD = 0  
                    }
                    if((playerCollidesWithWall(player,gridCell, 5, 0)) == false && counterD == gameGrid.length - 1){
                        //console.log("nema kolizije")
                        if(player.directionLobby == "d"){
                            player.velocityY =  0;
                            player.velocityX =  7;
                            player.directionLobby = null
                        }  
                    } 
                }
            }

        }

        /* pacman spritovi */

        if((this.image == this.pacman || this.image == this.pacmanI) &&  this.velocityX > 0 && imageSwap == 15)
            {this.image = this.pacmanR}
        else if((this.image == this.pacman || this.image == this.pacmanI) && this.velocityX < 0 && imageSwap == 15)
            {this.image = this.pacmanL}
        else if((this.image == this.pacman || this.image == this.pacmanI) && this.velocityY > 0 && imageSwap == 15)
            {this.image = this.pacmanD}
        else if((this.image == this.pacman || this.image == this.pacmanI) && this.velocityY < 0 && imageSwap == 15)
            {this.image = this.pacmanU} 
        else if((this.image == this.pacmanR || this.image == this.pacmanU || this.image == this.pacmanL || this.image == this.pacmanD) 
        && imageSwap == 15 && this.damagable == true)
            {this.image = this.pacman}
            /* sprite kad je pod damageom za simuliranje blinkanja */
        else if((this.image == this.pacmanR || this.image == this.pacmanU || this.image == this.pacmanL || this.image == this.pacmanD) 
        && imageSwap == 15 && this.damagable == false)
            {this.image = this.pacmanI}
        
        imageSwap++;
        if(imageSwap==16)
            imageSwap = 0


        this.draw()
        this.x += this.velocityX; 
        this.y += this.velocityY; 
    }
}

const movePlayer = () =>{
    /* for petlja kako bi se proverila kolizija sa svakim delom zida */
    for(let i = 0; i< gameGrid.length; i++){
        gridCell = gameGrid[i]
        if (keys['w'] || keys['ArrowUp']){
            //Korisceno za test -> console.log("kolizija: ",playerCollidesWithWall(player,gridCell,0,-5))
            /* Pre nego sto se izvrsi kretanje proverava se da li je to moguce 
            U koliko nije igrac se nece zaustavljati a prvi put kada naidje na prolaz gde moze
            da skrene sa prethdnom komandom to ce uraditi*/
            if(playerCollidesWithWall(player,gridCell,0,-7)){ // funkcija koja proverava da li ce doci do kolizije sa gornjom stranom igraca
                // u koliko je to slucaj pomeraj po y osi je 0, komanda se cuva da se mozda upotrebi kod sledeceg prolaza
                // a na osnovu prethodne putanje dobija se pomeraj po x osi
                player.velocityY =  0;
                if(player.velocityX != 0 || player.velocityY != 0)
                player.directionLobby = "w";
                
                if(player.lastDirection == "a") 
                    player.velocityX =  -7;
                else if(player.lastDirection == "d")
                    player.velocityX = 7;
                break;
            }
            else{
                //u koliko moze da skrene ka gore:
                if(i==gameGrid.length-1) //u koliko je je petlja prosla kroz sve instance znaci da defiitno necemo stati
                    {player.lastDirection = "w"
                    player.velocityY = -7;
                    player.velocityX =  0;}
            }
        }

        if (keys['s'] || keys['ArrowDown']){
            if(playerCollidesWithWall(player,gridCell,0,7)){
                player.velocityY = 0;
                if(player.velocityX != 0 || player.velocityY != 0)
                player.directionLobby = "s";
                if(player.lastDirection == "a")
                    player.velocityX =  -7;
                else if(player.lastDirection == "d")
                    player.velocityX = 7;
                break;
            }
            else{
                if(i==gameGrid.length-1)
                    {player.lastDirection = "s"
                    player.velocityY = 7;
                    player.velocityX = 0;}
            }   
        }

        if (keys['a'] || keys['ArrowLeft']){
            if(playerCollidesWithWall(player,gridCell,-7,0)){
                player.velocityX = 0;
                if(player.velocityX != 0 || player.velocityY != 0)
                player.directionLobby = "a";
                if(player.lastDirection == "w")
                    player.velocityY =  -7;
                else if(player.lastDirection == "s")
                    player.velocityY = 7;
                break;
            }
            else{
                if(i==gameGrid.length-1)
                    {player.lastDirection = "a"
                    player.velocityX = -7;
                    player.velocityY =  0;}
            } 
        }

        if (keys['d'] || keys['ArrowRight']){
            if(playerCollidesWithWall(player,gridCell,7,0)){
                player.velocityX = 0;
                if(player.velocityX != 0 || player.velocityY != 0)
                player.directionLobby = "d";
                if(player.lastDirection == "w")
                    player.velocityY =  -7;
                else if(player.lastDirection == "s")
                    player.velocityY = 7;
                break;
            }
            else{
                if(i==gameGrid.length-1)
                    {player.lastDirection = "d"
                    player.velocityX = 7;
                    player.velocityY = 0;}
            } 
        }
    }
}

player = new Player(cellSize * 1.5, cellSize * 1.5, 0, 0);

/* Funkica za proveru kolizije */
const playerCollidesWithWall = (player,gridCell,velX, velY) => {
    
    testPlayer = new Player(player.x + velX, player.y + velY , velX, velY)

    return(
        testPlayer.y - testPlayer.radius + testPlayer.velocityY  <= gridCell.y + gridCell.height && 
        testPlayer.x + testPlayer.radius + testPlayer.velocityX  >= gridCell.x && 
        testPlayer.y + testPlayer.radius + testPlayer.velocityY  >= gridCell.y && 
        testPlayer.x - testPlayer.radius + testPlayer.velocityX  <= gridCell.x + gridCell.width
        )
}

const enemyCollidesWithWall = (enemy,gridCell,velX, velY) => {
    
    testEnemy = new Enemy(enemy.x + velX, enemy.y + velY , velX, velY,"red")

    return(
        testEnemy.y - testEnemy.radius + testEnemy.velocityY  <= gridCell.y + gridCell.height && 
        testEnemy.x + testEnemy.radius + testEnemy.velocityX  >= gridCell.x && 
        testEnemy.y + testEnemy.radius + testEnemy.velocityY  >= gridCell.y && 
        testEnemy.x - testEnemy.radius + testEnemy.velocityX  <= gridCell.x + gridCell.width
    )
    
} 

/* GHOST SPRITES */

const redGhostSprites = {
    redGhostL : new Image(),
    redGhostR : new Image(),
    redGhostU : new Image(),
    redGhostD : new Image(),
}

redGhostSprites.redGhostL.src = "sprites/redGhost/rgleft.png"
redGhostSprites.redGhostR.src = "sprites/redGhost/rgright.png"
redGhostSprites.redGhostU.src = "sprites/redGhost/rgup.png"
redGhostSprites.redGhostD.src = "sprites/redGhost/rgdown.png"


const blueGhostSprites = {
    blueGhostL : new Image(),
    blueGhostR : new Image(),
    blueGhostU : new Image(),
    blueGhostD : new Image(),
}

blueGhostSprites.blueGhostL.src = "sprites/blueGhost/bgleft.png"
blueGhostSprites.blueGhostR.src = "sprites/blueGhost/bgright.png"
blueGhostSprites.blueGhostU.src = "sprites/blueGhost/bgup.png"
blueGhostSprites.blueGhostD.src = "sprites/blueGhost/bgdown.png"

const scaredGhostSprite = new Image()
scaredGhostSprite.src = "sprites/scaredGhost/scaredGhost.png"


class Enemy{

    constructor(x,y,velocityX,velocityY,color,image = null,rImage = null,uImage = null ,dImage = null){
        this.x = x; 
        this.y = y; 
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.originalColor = null
        this.color = color;
        this.radius = 15;
        this.image = image;
        this.imageL = image;
        this.imageR = rImage;
        this.imageU = uImage;
        this.imageD = dImage;
        this.imageS = scaredGhostSprite;
        this.speed = 5 ;
        this.previousCollision = [];
        
    } 

    draw(){
        /* ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath(); */ 
        ctx.drawImage(this.image, this.x - 20, this.y - 20)
    }

    update(){

        let collisions = []
        let gridCell 

        /* provera kolizije u svakom trenutku za duhove */

        for(let i=0; i<gameGrid.length; i++){
            gridCell = gameGrid[i]
            if(enemyCollidesWithWall(this,gridCell,0,3) && !(collisions.includes("s")))
                {
                collisions.push("s")
                //console.log("kolizija")
                break;
                }
            else if(i == gameGrid.length-1){
                //console.log("nema kolizija")
                if(collisions.includes("s"))
                    collisions.splice(collisions.indexOf("s"), 1) 
            }
            
        }      

        for(let i=0; i<gameGrid.length; i++){
            gridCell = gameGrid[i]
            if(enemyCollidesWithWall(this,gridCell,0,-3) && !(collisions.includes("w")))
                {
                collisions.push("w")
                break;
                }
            else if(i == gameGrid.length-1){
                if(collisions.includes("w"))
                    collisions.splice(collisions.indexOf("w"), 1) 
            }
            
        } 


        for(let i=0; i<gameGrid.length; i++){
            gridCell = gameGrid[i]
            if(enemyCollidesWithWall(this,gridCell,-3,0) && !(collisions.includes("a")))
                {
                collisions.push("a")
                break;
                }
            else if(i == gameGrid.length-1){
                if(collisions.includes("a"))
                    collisions.splice(collisions.indexOf("a"), 1)   
            }
            
        } 

        for(let i=0; i<gameGrid.length; i++){
            gridCell = gameGrid[i]
            if(enemyCollidesWithWall(this,gridCell,3,0) && !(collisions.includes("d")))
                {
                collisions.push("d")
                //console.log("kolizija")
                break;
                }
            else if(i == gameGrid.length-1){
                //console.log("nema kolizija")
                if(collisions.includes("d"))
                    collisions.splice(collisions.indexOf("d"), 1) 
            }
            
        }  

        if(collisions.length > this.previousCollision.length)
           {
                this.previousCollision = collisions
           }

        if(JSON.stringify(collisions) !== JSON.stringify(this.previousCollision)){

            if(this.velocityX > 0 && !(this.previousCollision.includes('d')))
                this.previousCollision.push('d')
            if(this.velocityX < 0 && !(this.previousCollision.includes('a')))
                this.previousCollision.push('a')
            if(this.velocityY > 0 && !(this.previousCollision.includes('s')))
                this.previousCollision.push('s')
            if(this.velocityY < 0 && !(this.previousCollision.includes('w')))
                this.previousCollision.push('w')
                

            const pathways = this.previousCollision.filter(collision =>{ return !collisions.includes(collision)})

            let direction

            if(pathways.length > 1){
                let shortestPathLen = null
                for(let i = 0; i< pathways.length; i++){
                    if(pathways[i] == 'd'){
                        let testGhost = new Enemy(this.x + 40,this.y, this.velocityX,this.velocityY)
                        if(ghostDirection(player,testGhost) < shortestPathLen || shortestPathLen == null){
                            direction = 'd'
                        }
                    }
                    else if(pathways[i] == 'a'){
                        let testGhost = new Enemy(this.x - 40,this.y, this.velocityX,this.velocityY)
                        if(ghostDirection(player,testGhost) < shortestPathLen || shortestPathLen == null){
                            direction = 'a'
                        }
                    }
                    else if(pathways[i] == 'w'){
                        let testGhost = new Enemy(this.x ,this.y - 40, this.velocityX,this.velocityY)
                        if(ghostDirection(player,testGhost) < shortestPathLen || shortestPathLen == null){
                            direction = 'w'
                        }
                    }
                    else if(pathways[i] == 's'){
                        let testGhost = new Enemy(this.x,this.y + 40, this.velocityX,this.velocityY)
                        if(ghostDirection(player,testGhost) < shortestPathLen || shortestPathLen == null){
                            direction = 's'
                        }
                    }

                }
            }
            else{
                direction = pathways[Math.floor(Math.random() * pathways.length)]
            }

            direction = pathways[Math.floor(Math.random() * pathways.length)]
            //console.log(direction)
            switch(direction){
                case 'w':
                    this.velocityX =  0
                    this.velocityY = -1 * this.speed
                    break
                case 'a':
                    this.velocityX = -1 * this.speed
                    this.velocityY =  0
                    break
                case 's':
                    this.velocityX =  0
                    this.velocityY =  this.speed
                    break
                case 'd':
                    this.velocityX =  this.speed
                    this.velocityY =  0
                    break
            }

            this.previousCollision = []
        }

        if(this.velocityX < 0 && player.superFeature == false)
            this.image= this.imageL
        if(this.velocityX > 0 && player.superFeature == false)
            this.image= this.imageR
        if(this.velocityY < 0 && player.superFeature == false)
            this.image= this.imageU
        if(this.velocityY > 0 && player.superFeature == false)
            this.image= this.imageD
            
               
        //console.log("trenutne", collisions)    
        //console.log("prethodne", this.previousCollision) 

        /* kolizija izmedju igraca i duha */

        let dx = (player.x + player.radius) - (this.x + this.radius);
        let dy = (player.y + player.radius) - (this.y + this.radius);
        let distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < player.radius + this.radius && player.damagable) {
            if(player.superFeature == false){
                //console.log("kolizija")
                hitNotation.innerHTML = ("You've been hit! Be careful")
                player.lives--
                player.damagable = false
                if(player.lives == 0){
                    if(score > highScore){
                        highScore = score;
                    } 
                    highScoreDisplay.innerHTML = ("High Score: " + highScore)
                    score = 0;                    
                    setTimeout(restartGame,2000)
                    //console.log("kraj igre :( ")
                }
                else{
                    setTimeout(()=>{
                        player.damagable = true
                        hitNotation.innerHTML = (" ")
                    },2000)
                }
            }
            else{
                score += 200 * ghostScoreValue;
                scoreDisplay.innerHTML = ("Score: " + score)
                ghostScoreValue++;
                ghosts = ghosts.filter((ghost)=>{return ghost != this})
            }
        }
        this.draw() 
        this.x += this.velocityX; 
        this.y += this.velocityY;  
    }
}

enemyRed = new Enemy(cellSize * 1.5 + 560, cellSize * 1.5 + 320, -5, 0, "red", 
redGhostSprites.redGhostL,redGhostSprites.redGhostR,redGhostSprites.redGhostU,redGhostSprites.redGhostD);

enemyGreen = new Enemy(cellSize * 1.5 + 480, cellSize * 1.5 + 320, 5, 0, "Green",
blueGhostSprites.blueGhostL,blueGhostSprites.blueGhostR,blueGhostSprites.blueGhostU,blueGhostSprites.blueGhostD); 

ghosts.push(enemyRed)
ghosts.push(enemyGreen) 


const ghostDirection = (player, ghost) => {

    let dx = (player.x + player.radius) - (ghost.x + ghost.radius);
    let dy = (player.y + player.radius) - (ghost.y + ghost.radius);
    let distance = Math.sqrt(dx * dx + dy * dy); 

    
    return distance
}

class Pellet{

    static #eaten = 0; //za pracenje broja pojedenih pelleta

    constructor(x,y,radius = 5, isSuper = false){
        this.x = x; 
        this.y = y; 
        this.isSuper = isSuper;
        this.radius = radius;
    }
    draw(){
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    static eat(){
        this.#eaten++;
    }

    static eatStart(){
        this.#eaten = 0;
    }

    static getEaten(){
        return this.#eaten
    }

}

class Cell{
    constructor(x,y,image){
        this.x = x; 
        this.y = y; 
        this.width = cellSize; 
        this.height = cellSize;
        this.image = image
    }

    draw(){
        /* ctx.strokeStyle = 'blue'; 
        ctx.fillStyle = 'blue';
        ctx.strokeRect(this.x, this.y, this.width, this.height); 
        ctx.fillRect(this.x, this.y, this.width, this.height); */ 

        ctx.drawImage(this.image, this.x , this.y)
    }
}

gameGridBluePrint.forEach((row,i) => {
    row.forEach((symbol,y) => {
            if(symbol === 1){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.vertical)
                )
            }
            else if(symbol === 2){
                pellets.push(
                    new Pellet(40 * y + 20,
                               40 * i + 20)
                )
            }
            else if(symbol === 3){
                pellets.push(
                    new Pellet(40 * y + 20,
                               40 * i + 20,10,true)
                )
            }
            else if(symbol === "l"){
                gameGrid.push(
                    new Cell(40 * y,
                            40 * i,
                            gridSprites.leftCorner)
                )
            }
            else if(symbol === 4){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.horizontal)
                )
            }
            else if(symbol === "r"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.rightCorner)
                )
            }
            else if(symbol === "ul"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.upLeft)
                )
            }
            else if(symbol === "ur"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.upRight)
                )
            }
            else if(symbol === "d"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.down)
                )
            }
            else if(symbol === "u"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.up)
                )
            }
            else if(symbol === "left"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.left)
                )
            }
            else if(symbol === "right"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.right)
                )
            }
            else if(symbol === "s1"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.spec1)
                )
            }
            else if(symbol === "s2"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.spec2)
                )
            }
            else if(symbol === "s3"){
                gameGrid.push(
                    new Cell(40 * y,
                             40 * i,
                             gridSprites.spec3)
                )
            }
    })
})

const animate = () => {

    ctx.clearRect(0,0,canvas.width,canvas.height)

    pellets.forEach((pellet,i) => {
        pellet.draw()
        if( player.y - player.radius + player.velocityY + 1.5 <= pellet.y + pellet.radius && 
            player.x + player.radius + player.velocityX - 1.5 >= pellet.x && 
            player.y + player.radius + player.velocityY - 1.5 >= pellet.y && 
            player.x - player.radius + player.velocityX + 1.5 <= pellet.x + pellet.radius 
            ){
                if(pellets[i].isSuper==true){
                    score += 100;
                    player.superFeature = true
                    ghosts.forEach((ghost)=>{
                        if(ghost.image != ghost.imageS){ 
                        ghost.image = ghost.imageS}
                    })
                    if(!isSuperPalletTimer)
                    {
                    isSuperPalletTimer = true
                    superPalletTimer = new Timer(function() {
                        player.superFeature = false; 
                        ghostScoreValue =1;
                        isSuperPalletTimer = false
                        }, 5000);
                    }
                    else{
                        superPalletTimer.restart()
                    }
                    /* setTimeout(()=>{ 
                        player.superFeature = false; 
                        ghostScoreValue =1
                        }, 5000) */
                }else{
                    score += 10;
                }
               delete pellets[i]
               //Pellets.length = 86
               Pellet.eat()
               if(Pellet.getEaten() == 86){
                //cancelAnimationFrame(animationID);
                player.damagable = false
                hitNotation.style.color = "#04b700"
                hitNotation.innerHTML = ("You collected all pellets! Restarting level...")
                setTimeout(restartGame,1500)
               }
               
               scoreDisplay.innerHTML = ("Score: " + score)
              // console.log(score) 
              //window.location.reload()
            }
    })

    gameGrid.forEach((gridCell) => {
        gridCell.draw();

        if( player.y - player.radius + player.velocityY  <= gridCell.y + gridCell.height && 
            player.x + player.radius + player.velocityX  >= gridCell.x && 
            player.y + player.radius + player.velocityY  >= gridCell.y && 
            player.x - player.radius + player.velocityX  <= gridCell.x + gridCell.width
            ){
                player.velocityX = 0; 
                player.velocityY = 0;
            } 
    })
    
    player.update()
    ghosts.forEach(ghost => {
        ghost.update();
    });

    livesDisplay.innerHTML = ("Remaining lives: " + player.lives)

    if(player.lives > 0 /* ||  Pellet.getEaten() <  5 */)
        animationID = requestAnimationFrame(animate);
}

animate()

addEventListener('keydown', (event)=>{
    if(event.key == 'Escape' && !isPaused){
        if(player.superFeature == true){
            superPalletTimer.pause()
        }
        cancelAnimationFrame(animationID);
        pauseText.innerHTML = ('Press ESC to resume game')
        isPaused = !isPaused;
    }
    else if(event.key == 'Escape' && isPaused){
        if(player.superFeature == true){
            superPalletTimer.resume()
        }
        animate()
        pauseText.innerHTML = ('Press ESC to pause game')
        isPaused = !isPaused;
    } 
    else if(event.key == 'r'){
        restartGame()
    }  
    keys[event.key] = true;
    movePlayer();
 }) 

addEventListener('keyup', (event)=>{
    delete keys[event.key]
})
/* restartovanje igare restartovanjem objekata */
const restartGame = () =>{
    cancelAnimationFrame(animationID);

    hitNotation.style.color = "#ee0000"
    hitNotation.innerHTML = (" ")

    ctx.clearRect(0,0,canvas.width,canvas.height)

    let remainingLives = player.lives

    console.log(remainingLives)

    player = new Player(cellSize * 1.5, cellSize * 1.5, 0, 0);

    /* u koliko je igra zavrsena kupljenjem pelleta, zivoti se ne vracaju na 3 */
    if(remainingLives > 0)
        player.lives = remainingLives

    ghosts.pop(enemyRed)
    ghosts.pop(enemyGreen) 

    enemyRed = new Enemy(cellSize * 1.5 + 560, cellSize * 1.5 + 320, -5, 0, "red",
    redGhostSprites.redGhostL,redGhostSprites.redGhostR,redGhostSprites.redGhostU,redGhostSprites.redGhostD);

    enemyGreen = new Enemy(cellSize * 1.5 + 480, cellSize * 1.5 + 320, 5, 0, "Green",
    blueGhostSprites.blueGhostL,blueGhostSprites.blueGhostR,blueGhostSprites.blueGhostU,blueGhostSprites.blueGhostD);

    ghosts.push(enemyRed)

    ghosts.push(enemyGreen) 

    Pellet.eatStart();

    for(let i = 0; i< pellets.length; i++)
        delete pellets[i]

    gameGridBluePrint.forEach((row,i) => {
        row.forEach((symbol,y) => {
                if(symbol === 2){
                    pellets.push(
                        new Pellet(40 * y + 20,
                                   40 * i + 20)
                    )
                }
                else if(symbol === 3){
                    pellets.push(
                        new Pellet(40 * y + 20,
                                   40 * i + 20,10,true)
                    )
                }
        })
    })
    animate()
}

class Timer {
    constructor(callback, delay) {
        var timerId, start, remaining = delay;

        this.pause = function () {
            window.clearTimeout(timerId);
            timerId = null;
            remaining -= Date.now() - start;
        };

        this.resume = function () {
            if (timerId) {
                return;
            }
            start = Date.now();
            timerId = window.setTimeout(callback, remaining);
        };

        this.restart = function (){
            window.clearTimeout(timerId);
            start = Date.now();
            timerId = window.setTimeout(callback, delay);
        };

        this.resume();
    }
}


  