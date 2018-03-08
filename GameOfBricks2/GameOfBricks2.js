var canvas = document.getElementById("canvas");
var processing = new Processing(canvas, function(processing) {
    processing.size(400, 400);
    processing.background(0xFFF);

    var mouseIsPressed = false;
    processing.mousePressed = function () { mouseIsPressed = true; };
    processing.mouseReleased = function () { mouseIsPressed = false; };

    var keyIsPressed = false;
    processing.keyPressed = function () { keyIsPressed = true; };
    processing.keyReleased = function () { keyIsPressed = false; };

    function getImage(s) {
        var url = "https://www.kasandbox.org/programming-images/" + s + ".png";
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    function getLocalImage(url) {
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    // use degrees rather than radians in rotate function
    var rotateFn = processing.rotate;
    processing.rotate = function (angle) {
        rotateFn(processing.radians(angle));
    };

    with (processing) {
      
/**
 * ---Game of Bricks 2---
 * @author prolightZero
 * @description This is the sequel to Game of Bricks, if you haven't played that play that now before playing this game.
**/

var game = {
    levelInfo : {
        level : "intro",  
        width : width,
        height : height,
    },
    gameStateInfo : {
        gameState : "play",    
    },
    barInfo : {
        coins : 0,
        score : 0,
    },
};

var keys = [];
keyPressed = function()
{
    keys[keyCode] = true;
    game.keyPressed();
};
keyReleased = function()
{
    keys[keyCode] = false;
};

var observer = {
    collisionTypes : {
        "blank" : {
            colliding : function() {},
            applyCollision : function() {},
        },
        "rectrect" : {
            colliding : function(obj1, obj2)
            {
                var colliding = false;
                
                //Check xPosition and width
                if(obj1.xPos + obj1.width > obj2.xPos &&
                   obj1.xPos < obj2.xPos + obj2.width)
                {
                    //Check yPosition and width
                    if(obj1.yPos + obj1.height > obj2.yPos &&
                       obj1.yPos < obj2.yPos + obj2.height)
                    {
                        colliding = true;
                    }
                }
                return colliding;
            },
            applyCollision : function(obj1, obj2)
            {
                var mobileObj = obj1;
                var fixedObj = obj2;
                switch(mobileObj.direction)
                {
                    case "LEFT" :
                            mobileObj.xPos = fixedObj.xPos + fixedObj.width;
                        break;
                        
                    case "RIGHT" :
                            mobileObj.xPos = fixedObj.xPos - mobileObj.width;
                        break;
                    
                    case "UP" :
                            mobileObj.yPos = fixedObj.yPos + fixedObj.height;
                        break;
                        
                    case "DOWN" :
                            mobileObj.yPos = fixedObj.yPos - mobileObj.height;
                        break;
                }
            },
        },
    },
    colliding : function(obj1, obj2)
    {
        var info = observer.getCollisionType(
            obj1.info.physics.shape, 
            obj2.info.physics.shape
        );
        var collided = false;
        if(!info.flipped)
        {
            collided = observer.collisionTypes[info.type].colliding(obj1, obj2);
        }else{
            collided = observer.collisionTypes[info.type].colliding(obj2, obj1);
        }
        return collided;
    },
    applyCollision : function(obj1, obj2)
    {
        var info = observer.getCollisionType(
            obj1.info.physics.shape, 
            obj2.info.physics.shape
        );
        if(!info.flipped)
        {
            observer.collisionTypes[info.type].applyCollision(obj1, obj2);
        }else{
            observer.collisionTypes[info.type].applyCollision(obj2, obj1);
        }
    },
    getType : function(name1, name2, delegate)
    {
        var typeToReturn = "blank";
        var flipped = false;
        var type = name1 + name2;
        if(typeof delegate[type] !== "undefined")
        {
            typeToReturn = type;
        }else{
            //Flip shapes
            flipped = true;
            type = name2 + name1;
            if(typeof delegate[type] !== "undefined")
            {
                typeToReturn = type;
            }else{
                //None of the types existed
                typeToReturn = "blank"; 
            }
        }
        return {
            type : typeToReturn,
            flipped : flipped,
        };
    },
    getCollisionType : function(shape1, shape2, delegate)
    {
        return observer.getType(shape1, shape2, observer.collisionTypes);
    },
};

var Camera = function(xPos, yPos, Width, Height)
{
    this.xPos = xPos;
    this.yPos = yPos;
    this.width = Width;
    this.height = Height;
    this.halfWidth = this.width/2;
    this.halfHeight = this.height/2;
    
    this.view = function(obj)
    {
        this.xPos = obj.xPos + obj.width/2;
        this.yPos = obj.yPos + obj.height/2;
        
        this.xPos = constrain(this.xPos, 
        this.halfWidth, game.levelInfo.width - this.halfWidth);
        this.yPos = constrain(this.yPos, 
        this.halfHeight, game.levelInfo.height - this.halfHeight);
        
        if(game.levelInfo.width >= this.width)
        {
            translate(this.halfWidth - this.xPos, 0);
        }
        if(game.levelInfo.height >= this.height)
        {
            translate(0, this.halfHeight - this.yPos);
        }
    };
};
var cam = new Camera(0, 0, width, height);

var GameObject = function(config)
{
    this.xPos = config.xPos;
    this.yPos = config.yPos;
    this.width = config.width;
    this.height = config.height;
    this.color = config.color;
    
    this.draw = function() 
    {
        fill(this.color);
        rect(this.xPos, this.yPos, this.width, this.height);
    };
    
    this.update = config.update || function() {};
};
var createArray = function(Obj)
{
    var array = [];
    array.Obj = Obj;
    array.add = function(config)
    {
        var obj = new Obj(config);
        this.push(obj);
    };
    array.draw = function() 
    {
        for(var i = 0; i < this.length; i++)
        {
            this[i].draw();   
        }
    };
    array.update = function() 
    {
        for(var i = 0; i < this.length; i++)
        {
            this[i].update();   
        }
    };
    array.clear = function()
    {
        this.splice(0, this.length);   
    };
    array.getLast = function()
    {
        if(this.length > 1)
        {
            return  this[this.length - 1];
        }else{
            return this[0];
        }
    };
    return array;
};

var IsMouseInside = function(obj)
{
    return (mouseX > obj.xPos && 
            mouseX < obj.xPos + obj.width) &&
           (mouseY > obj.yPos && 
            mouseY < obj.yPos + obj.height);   
};
var Button = function(config)
{
    this.xPos = config.xPos;
    this.yPos = config.yPos;
    this.width = config.width;
    this.height = config.height;
    this.color = config.color || color(149, 179, 66);
    
    this.message = config.message || "";
    this.textSize = config.textSize || 12.5;
    this.textColor = config.textColor || 0;
    this.name = config.name || "button";
    
    this.draw = function() 
    {
        fill(this.color);
        rect(this.xPos, this.yPos, this.width, this.height);
        fill(0, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(this.textSize);
        fill(this.textColor);
        text(this.message, this.xPos + this.width/2, this.yPos + this.height/2);
    };
    
    
};
var buttons = createArray(Button);
buttons.refs = {};
buttons.addButton = function(config)
{
    this.refs[config.name || this.length] = this.length;
    this.add(config);
};
buttons.getButton = function(name)
{
    if(this.refs[name] !== undefined &&
    this[this.refs[name]] !== undefined)
    {
        return this[this.refs[name]];
    }else{
        return new Button({});    
    }
};
buttons.clear = function()
{
    this.refs = {};
    this.splice(0, this.length);
};

var CodeKeeper = function(config)
{
    this.code = config.code || [];
    
    this.checkCode = [];
    
    this.IsUnlocked = function()
    {
        var unlocked = false;
        if(this.checkCode.length >= this.code.length)
        {
            for(var i = 0; i < this.code.length; i++)
            {
                if(this.checkCode[i] === this.code[i])
                {
                    unlocked = true;
                }else{
                    this.checkCode.splice(0, 1);
                    unlocked = false;
                    break;    
                }
            }
        }
        return unlocked;
    };
    
    this.updateCode = function(nextKey)
    {
        this.checkCode.push(nextKey);
        if(this.checkCode.length > this.code.length)
        {
            this.checkCode = [];
        }
    };
};
var codeKeepers = createArray(CodeKeeper);

var gameObjects = createArray([]);
gameObjects.arrayRefs = {};
gameObjects.addArray = function(name, array)
{
    gameObjects.arrayRefs[name] = this.length;
    this.push(array);   
};
gameObjects.getArray = function(name)
{
    if(this.arrayRefs[name] !== undefined &&
    this[this.arrayRefs[name]] !== undefined)
    {
        return this[this.arrayRefs[name]];
    }else{
        println("Error referencing gameObject array '" + name + "'.");
        return createArray(GameObject);    
    }
};
gameObjects.addObject = function(name, config)
{
    this.getArray(name).add(config);
};
gameObjects.removeObjects = function()
{
    for(var i = 0; i < this.length; i++)
    {
        this[i].splice(0, this[i].length);    
    }
};
gameObjects.replaceObjects = function(objs)
{
    for(var i = 0; i < objs.length; i++)
    {
        this.getArray(objs[i].array)[objs[i].index] = (objs[i].obj);
    }
};
gameObjects.handleCollisions = function()
{
    var comparisions = 0;
    var collisions = [];
    
    for(var i = 0; i < this.length; i++)
    {
        if(this[i].length > 0 && this[i][0].info.physics.movement === "mobile")
        {
            for(var j = 0; j < this[i].length; j++)
            {
                var obj1 = this[i][j];
                for(var i2 = 0; i2 < this.length; i2++)
                {
                    var inJ2 = 0;
                    if(i === i2)
                    {
                        inJ2 = j; //Collision limiter
                    }
                    for(var j2 = inJ2; j2 < this[i2].length; j2++)
                    {
                        var obj2 = this[i2][j2];
                        
                        //You can't collide with yourself!
                        if(!(i === i2 && j === j2) && obj2.info.physics.solidObject) 
                        {
                            if(observer.colliding(obj1, obj2))
                            {
                                //collisions.push([[i, j], [i2, j2]]);
                                observer.applyCollision(obj1, obj2);
                            }
                            comparisions++;
                        }
                    }
                }
            }
        }
    }
    
    /*text("comparisions : " + comparisions, 20, 20);
    text("collisions : " + collisions.length, 20, 30);
    
    for(var i = 0; i < collisions.length; i++)
    {
        text("[[" + collisions[i][0] + "],[" + collisions[i][1] +"]],", 
        20, 45 + i * 12);
    }*/
};

var Block = function(config)
{
    GameObject.call(this, config);
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : true,
        },
    };
};
gameObjects.addArray("block", createArray(Block));

var MovingBlock = function(config)
{
    GameObject.call(this, config);
    
    this.maxXPos = config.maxXPos || this.xPos;
    this.minXPos = config.minXPos || this.xPos;
    this.xVel = config.xVel || 0;
    
    this.maxYPos = config.maxYPos || this.yPos;
    this.minYPos = config.minYPos || this.yPos;
    this.yVel = config.yVel || 0;
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "mobile",
            solidObject : true,
        },
    };
    
    this.update = function()
    {
        if(this.xPos > this.maxXPos || this.xPos < this.minXPos)
        {
            this.xVel = -this.xVel;
        }
        if(this.xVel < 0)
        {
            this.direction = "LEFT";
        }
        if(this.xVel > 0)
        {
            this.direction = "RIGHT";
        }
        this.xPos += this.xVel;
        
        if(this.yPos > this.maxYPos || this.yPos < this.minYPos)
        {
            this.yVel = -this.yVel;
        }
        if(this.yVel < 0)
        {
            this.direction = "UP";
        }
        if(this.yVel > 0)
        {
            this.direction = "DOWN";
        }
        this.yPos += this.yVel;
        this.direction = "";
    };
};
gameObjects.addArray("movingBlock", createArray(MovingBlock));

var LavaBlock = function(config)
{
    GameObject.call(this, config);
    
    this.color = config.color || color(255, 145, 50);
    this.damage = config.damage || 1;
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : true,
        },
    };
    
    this.kill = function(obj)
    {
        if(observer.colliding(this, obj))
        {
            obj.hp -= config.damage;
        }
    };
};
gameObjects.addArray("lavaBlock", createArray(LavaBlock));
gameObjects.getArray("lavaBlock").kill = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        if(observer.colliding(this[i], obj))
        {
            this[i].kill(obj);
            break;
        }
    }
};

var MovingLavaBlock = function(config)
{
    LavaBlock.call(this, config);
    MovingBlock.call(this, config);
    
    this.color = config.color || color(255, 145, 50);
    this.damage = config.damage || 1;
};
gameObjects.addArray("movingLavaBlock", createArray(MovingLavaBlock));
gameObjects.getArray("movingLavaBlock").kill = gameObjects.getArray("lavaBlock").kill;

var Lava = function(config)
{
    LavaBlock.call(this, config);
    this.info.physics.solidObject = false;
    this.damage = config.damage || 1;
};
gameObjects.addArray("lava", createArray(Lava));
gameObjects.getArray("lava").kill = gameObjects.getArray("lavaBlock").kill;

var MovingLava = function(config)
{
    MovingLavaBlock.call(this, config);
    this.info.physics.solidObject = false;
};
gameObjects.addArray("movingLava", createArray(MovingLava));
gameObjects.getArray("movingLava").kill = gameObjects.getArray("lavaBlock").kill;

var RerouterBlock = function(config)
{
    GameObject.call(this, config);
    
    this.routeXPos = config.routeXPos;
    this.routeYPos = config.routeYPos;
    
    this.routeObj = config.routeObj;
    this.onReroute = config.onReroute || function() {};
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : false,
        },
    };
    
    this.draw = function() 
    {
        noStroke();
        fill(this.color);
        rect(this.xPos, this.yPos, this.width, this.height);
        stroke(0, 0, 0);
    };
    
    this.rerouteToObj = function(obj)
    {
        if(this.routeObj !== undefined)
        {
            var array = [];
            if(typeof this.routeObj[0] === "string")
            {
                array = gameObjects.getArray(this.routeObj[0]);
            }else{
                array = gameObjects[this.routeObj[0]];
            }
            var toObj = array[this.routeObj[1]];
            this.onReroute(obj);
            obj.xPos = toObj.xPos;
            obj.yPos = toObj.yPos;
        }
    };
    
    this.reroute = function(obj)
    {
        this.onReroute(obj);
        obj.xPos = this.routeXPos || obj.xPos;
        obj.yPos = this.routeYPos || obj.yPos;
    };
};
gameObjects.addArray("rerouterBlock", createArray(RerouterBlock));
gameObjects.getArray("rerouterBlock").reroute = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        if(observer.colliding(this[i], obj))
        {
            this[i].reroute(obj);
            break;
        }
    }
};
gameObjects.getArray("rerouterBlock").rerouteToObj = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        if(observer.colliding(this[i], obj))
        {
            this[i].rerouteToObj(obj);
            break;
        }
    }
};

var Sign = function(config)
{
    GameObject.call(this, config);
     
    this.color = color(211, 219, 103);
     
    this.message = config.message || "This is a Sign."; 
    this.textXPos = config.textXPos || 0;
    this.textYPos = config.textYPos || 0;
    this.textWidth = config.textWidth || 0;
    this.textHeight = config.textHeight || 0;
    this.textSize = config.textSize || 12;
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : false,
        },
    };
    
    this.stemHeight = this.height * 1.85;
    this.stemWidth = this.width/8;
    
    this.draw = function() 
    {
        fill(this.color);
        rect(this.xPos + (this.width/2 - this.stemWidth/2), 
        this.yPos, this.stemWidth, this.stemHeight);
        rect(this.xPos, this.yPos, this.width, this.height); 
        
        fill(0, 0, 0);
        for(var y = 0; y < this.height; y += this.height/5)
        {
            line(this.xPos + this.width/7, this.yPos + y, 
            this.xPos + this.width - this.width/7, this.yPos + y);
        }
    };
    
    this.onRead = function()
    {
        fill(this.color);
        rect(this.xPos + this.textXPos - 5, this.yPos + this.textYPos - 15, 
        this.textWidth, this.textHeight);
        
        fill(0, 0, 0);
        textSize(this.textSize);
        textAlign(NORMAL);
        text(this.message, this.xPos + this.textXPos, this.yPos + this.textYPos);
    };
};
gameObjects.addArray("sign", createArray(Sign));
gameObjects.getArray("sign").onRead = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        if(observer.colliding(this[i], obj))
        {
            this[i].onRead();
        }
    }
};

var CheckPoint = function(config)
{
    GameObject.call(this, config);
    
    this.checked = false;
    this.checkedColor = config.checkedColor || color(31, 148, 21);
    this.color = config.color || color(13, 13, 13);
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : false,
        },
    };
    
    this.draw = function() 
    {
        var clr = (!this.checked) ? this.color : this.checkedColor;
        fill(clr);
        
        triangle(this.xPos, this.yPos, 
        this.xPos, this.yPos + this.height/2, 
        this.xPos + this.width, this.yPos + this.height/4);
        rect(this.xPos, this.yPos, 1, this.height); 
    };
    
    this.check = function(obj)
    {
        if(observer.colliding(this, obj) && obj.addCheckPoint !== undefined)
        {
            if(!this.checked)
            {
                game.saveScore();
            }
            this.checked = true;
            obj.addCheckPoint(this.xPos, this.yPos);
        }
    };
};
gameObjects.addArray("checkPoint", createArray(CheckPoint));
gameObjects.getArray("checkPoint").check = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        this[i].check(obj);
    }
};

var Goal = function(config)
{
    GameObject.call(this, config);
    
    this.color = config.color || color(50, 205, 40);
    this.lastColor = this.color;
    this.IsActive = config.IsActive || function() {return true;};
    this.level = config.level;
    this.waitTime = config.waitTime || 5;
    this.timer = 0;
    this.started = false;
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : false,
        },
    };
    
    this.draw = function() 
    {
        fill(this.color);
        rect(this.xPos, this.yPos, this.width, this.height);
        textAlign(CENTER, CENTER);
        textSize(15);
        fill(0, 0, 0);
        text(this.timer, this.xPos + this.width/2, this.yPos + this.height/2); 
        line(this.xPos, this.yPos, this.xPos + this.width, this.yPos + this.height);
        line(this.xPos + this.width, this.yPos, this.xPos, this.yPos + this.height);
        noFill();
        ellipse(this.xPos + this.width/2, this.yPos + this.height/2, 
        this.width + this.width* 0.4,this.height + this.height * 0.4);
    };
    
    this.onEnter = function(obj)
    {
        if(keys[32] && observer.colliding(this, obj))
        {
            this.started = true;
        }else{
            if(this.timer > this.waitTime)
            {
                this.started = false;
                this.timer = 0;  
                this.color = this.lastColor;
            }
        }
        if(this.started)
        {
            this.timer++;
            if(this.IsActive())
            {
                this.lastColor = this.color;
                this.color = this.color + this.timer/2;
                if(this.timer > this.waitTime)
                {
                    game.saveScore();
                    game.changeLevel(this.level); 
                }
            }
        }
        
    };

};
gameObjects.addArray("goal", createArray(Goal));
gameObjects.getArray("goal").onEnter = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        this[i].onEnter(obj);
    }
};

var Hp = function(config)
{
    GameObject.call(this, config);
    
    this.amt = config.amt || 5;
    this.color = config.color || color(142, 179, 41);
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "fixed",
            solidObject : false,
        },
    };
    
    this.draw = function() 
    {
        fill(this.color);
        ellipse(this.xPos + this.width/2, this.yPos + this.height/2, 
        this.width, this.height);
    };
    
    this.collect = function(obj)
    {
        obj.hp += this.amt;
        obj.score += this.amt * 5;
    };
};
gameObjects.addArray("hp", createArray(Hp));
gameObjects.getArray("hp").collect = function(obj)
{
    for(var i = 0; i < this.length; i++)
    {
        if(observer.colliding(this[i], obj))
        {
            this[i].collect(obj);
            this.splice(i, 1);
            break;
        }
    }
};

var Coin = function(config)
{
    Hp.call(this, config);
    
    this.color = config.color || color(255, 255, 0, 150);
    this.amt = config.amt || 1;
    
    this.collect = function(obj)
    {
        obj.coins += this.amt;
        obj.score += this.amt * 10;
    };
};
gameObjects.addArray("coin", createArray(Coin));
gameObjects.getArray("coin").collect = gameObjects.getArray("hp").collect;

var Player = function(config)
{
    GameObject.call(this, config);
    
    this.hp = 100;
    this.coins = 0;
    this.score = 0;
    this.resetXPos = 0;
    this.resetYPos = 0;
    this.usingCheckPoint = false;    
    
    this.info = {
        physics : {
            shape : "rect",
            movement : "mobile",
            solidObject : true,
        },
    };
    
    this.speed = 5;
    this.direction = "";
    
    this.stats = function() 
    {
        var hpBarXPos = 0;
        var hpBarYPos = 0;
        fill(0, 0, 0, 50);
        rect(0, 0, 400, 15);
        fill(0, 85, 255, 100);
        rect(hpBarXPos, hpBarYPos, this.hp, 15);
        noFill();
        rect(hpBarXPos, hpBarYPos, 100, 15);
        fill(0, 0, 0);
        text("hp : " + this.hp, hpBarXPos + 5, hpBarYPos + 12);
        fill(0, 0, 0);
        text("coins : " + (this.coins + game.barInfo.coins), 110, 12);
        text("score : " + (this.score + game.barInfo.score), 180, 12);
        text("level : " + game.levelInfo.level, 260, 12);
    };
    
    this.addCheckPoint = function(xPos, yPos)
    {
        this.resetXPos = xPos;
        this.resetYPos = yPos;
        this.usingCheckPoint = true; 
    };
    
    this.kill = function()
    {
        if(this.usingCheckPoint)
        {
            var con = config;
            config.xPos = this.resetXPos;
            config.yPos = this.resetYPos;
            game.changeLevel(game.levelInfo.level, [{
                array : "player", 
                index : 0,
                obj : new Player(config),
            }]);
        }else{
            game.changeLevel(game.levelInfo.level);
        }
    };
    
    this.update = function()
    {
        switch(true)
        {
            case keys[LEFT] : 
                this.xPos -= this.speed;
                this.direction = "LEFT";
                break;
                
            case keys[RIGHT] : 
                this.xPos += this.speed;
                this.direction = "RIGHT";
                break;
                
            case keys[UP] : 
                this.yPos -= this.speed;
                this.direction = "UP";
                break;
                
            case keys[DOWN] : 
                this.yPos += this.speed;
                this.direction = "DOWN";
                break;
                
            default : 
                    this.direction = "";
                break;
        }
        
        if(this.hp <= 0)
        {
            this.kill();    
        }
        this.hp = min(this.hp, 100);
        
        
        //If the spaceBar is Pressed
        if(keys[32])
        {
            gameObjects.getArray("sign").onRead(this);
        }
        gameObjects.getArray("goal").onEnter(this);
        
        gameObjects.getArray("rerouterBlock").rerouteToObj(this);
        gameObjects.getArray("rerouterBlock").reroute(this);
        gameObjects.getArray("checkPoint").check(this);
        gameObjects.getArray("lavaBlock").kill(this);
        gameObjects.getArray("movingLavaBlock").kill(this);
        gameObjects.getArray("lava").kill(this);
        gameObjects.getArray("movingLava").kill(this);
        gameObjects.getArray("hp").collect(this);
        gameObjects.getArray("coin").collect(this);
       
        this.xPos = constrain(this.xPos, 0, game.levelInfo.width - this.width);
        this.yPos = constrain(this.yPos, 0, game.levelInfo.height - this.height);
    };
};
gameObjects.addArray("player", createArray(Player));

var BlockCluster = function(config)
{
    Block.call(this, config);
    this.halfWidth = this.width/2;
    this.halfHeight = this.height/2;
    this.blocks = createArray(Block);
    
    for(var i = 0; i < config.clusterAmt; i++)
    {
        var con = config.block();
        con.width = constrain(con.width, 0, this.width);
        con.height = constrain(con.height, 0, this.height);
        con.xPos = constrain(con.xPos, -this.halfWidth, this.halfWidth);
        con.yPos = constrain(con.yPos, -this.halfHeight, this.halfHeight);
        this.blocks.add({
            xPos : this.xPos + this.halfWidth + con.xPos,
            yPos : this.yPos + this.halfHeight + con.yPos,
            width : con.width,
            height : con.height,
            color : con.color,
        });
    }
    
    this.draw = function() 
    {
        noStroke();
        this.blocks.draw();
    };
};
var squares = createArray(BlockCluster);
squares.generate = function(config)
{
    this.clear();
    for(var i = 0; i < config.amt; i++)
    {
        this.add(config.generate());
    }
};

var levels = {
    "intro" : {
        width : width,
        height : height,
        backGround : function() 
        {
            background(75, 175, 70);
        },
        load : function()
        {
            var nextLevel = "run";
            gameObjects.addObject("player", {
                xPos : 300, 
                yPos : 275, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            gameObjects.addObject("goal", {
                xPos : 30, 
                yPos : 275, 
                width : 30, 
                height : 30, 
                level : nextLevel,
            });
            gameObjects.addObject("sign", {
                xPos : 215, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -60,
                
                message : "Welcome to level1. \nThe object of the game \nis to get to the Goal \n(The green block).\n             <--"
            });
            gameObjects.addObject("block", {
                xPos : 295, 
                yPos : 115, 
                width : 105, 
                height : 35, 
                color : color(0, 0, 255),
            });
            gameObjects.addObject("block", {
                xPos : 130, 
                yPos : 115, 
                width : 30, 
                height : 300, 
                color : color(0, 0, 255),
            });
        }
    },
    "run" : {
        width : width,
        height : height,
        backGround : function() 
        {
            background(75, 175, 70);
        },
        load : function()
        {
            var nextLevel = "dodge";
            gameObjects.addObject("player", {
                xPos : 350, 
                yPos : 200, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            gameObjects.addObject("goal", {
                xPos : 330, 
                yPos : 20, 
                width : 30, 
                height : 30, 
                level : nextLevel,
            });
            gameObjects.addObject("sign", {
                xPos : 345, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "RUN! \n <--"
            });
            gameObjects.addObject("block", {
                xPos : 60, 
                yPos : 115, 
                width : 400, 
                height : 35, 
                color : color(0, 0, 255),
            });
            gameObjects.addObject("lavaBlock", {
                xPos : 0, 
                yPos : 150, 
                width : 20, 
                height : 400, 
                damage : 1,
            });
            
            for(var x = 0; x < 5; x++)
            {
                gameObjects.addObject("lava", {
                    xPos : 60 + x * 60, 
                    yPos : 150, 
                    width : 20, 
                    height : 250, 
                    damage : 1,
                });
            }
            gameObjects.addObject("hp", {
                xPos : 130, 
                yPos : 65, 
                width : 20, 
                height : 20, 
                amt : 50,
            });
            gameObjects.addObject("coin", {
                xPos : 200, 
                yPos : 40, 
                width : 20, 
                height : 20, 
                amt : 10,
            });
            gameObjects.addObject("coin", {
                xPos : 100, 
                yPos : 40, 
                width : 20, 
                height : 20, 
                amt : 10,
            });
        }
    },
    "dodge" : {
        width : width,
        height : height,
        backGround : function() 
        {
            background(75, 175, 70);
        },
        load : function()
        {
            var nextLevel = "theLevel";
            gameObjects.addObject("player", {
                xPos : 350, 
                yPos : 350, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            gameObjects.addObject("goal", {
                xPos : 330, 
                yPos : 30, 
                width : 30, 
                height : 30, 
                level : nextLevel,
            });
            gameObjects.addObject("sign", {
                xPos : 300, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "Watch out! \n   <--"
            });
            gameObjects.addObject("block", {
                xPos : 50, 
                yPos : 115, 
                width : 405, 
                height : 35, 
                color : color(0, 0, 255),
            });
            gameObjects.addObject("hp", {
                xPos : 150, 
                yPos : 50, 
                width : 20, 
                height : 20, 
                amt : 33,
            });
            gameObjects.addObject("hp", {
                xPos : 175, 
                yPos : 75, 
                width : 20, 
                height : 20, 
                amt : 33,
            });
            gameObjects.addObject("hp", {
                xPos : 200, 
                yPos : 50, 
                width : 20, 
                height : 20, 
                amt : 33,
            });
            gameObjects.addObject("movingLava", {
                xPos : 150, 
                yPos : 150, 
                maxYPos : 380,
                yVel : 5,
                
                width : 100, 
                height : 20, 
                damage : 10, 
            });
            gameObjects.addObject("movingLava", {
                xPos : 50, 
                yPos : 370, 
                minYPos : 150,
                maxYPos : 380,
                yVel : 7,
                
                width : 100, 
                height : 20, 
                damage : 10, 
            });
            
            gameObjects.addObject("lava", {
                xPos : 50, 
                yPos : 0, 
                width : 10, 
                height : 150, 
                damage : 0.5, 
            });
        }
    },
    "theLevel" : {
        width : 2000,
        height : 400,
        backGround : function() 
        {
            background(75, 175, 70);
        },
        load : function()
        {
            gameObjects.addObject("player", {
                xPos : 30, 
                yPos : 70, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            
            var levelNames = ["dodge", "theLevel", "maze"];
            levelNames.choose = function()
            {
                var index = 0;
                var last = ((this.length - 1 > -1) ? this.length - 1 : 0);
                index = round(random(0, last));
                var name = this[index];
                this.splice(index, 1);
                return name;
            };
            
            var waitTime = 100;
            var spacing = 100;
            var deadCoreColor = color(102, 101, 102, 100);
            var IsActive = function()
            {
                var active = false;
                var goals = gameObjects.getArray("goal");
                for(var i = 0; i < goals.length; i++)
                {
                    if(goals[i].timer > 0)
                    {
                        active = true;
                    }else{
                        active = false;
                        break;
                    }
                }
                return active;
            };
            
            for(var i = 0; i < 3; i++)
            {
                gameObjects.addObject("goal", {
                    xPos : 40 + spacing * i, 
                    yPos : 210, 
                    width : 30, 
                    height : 30,
                    waitTime : waitTime,
                    color : deadCoreColor,
                    level : levelNames.choose(),
                    IsActive : IsActive
                });
            }
            
            gameObjects.addObject("sign", {
                xPos : 300, 
                yPos : 230, 
                width : 50, 
                height : 30, 
                
                textYPos : -10,
                
                message : "choose wisely"
            });
            gameObjects.addObject("sign", {
                xPos : 200, 
                yPos : 330, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "The cores need to all be\n activated for them to work."
            });
            
            var spacing = 150;
            gameObjects.addObject("sign", {
                xPos : 1 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "Welcome to \"theLevel\"!\n        This way     -->"
            });
            gameObjects.addObject("sign", {
                xPos : 2 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "As you may have noticed there \nare mysteriously 3 ancient portals...(really goals)"
            });
            gameObjects.addObject("sign", {
                xPos : 2.5 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "since they are ancient\n they cores have faded"
            });
            gameObjects.addObject("sign", {
                xPos : 3.5 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textYPos : -10,
                
                message : "There are 3 possibilities..."
            });
            gameObjects.addObject("sign", {
                xPos : 4 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textYPos : -20,
                
                message : "\"Intro\", \"Maze\", and \"TheLevel\""
            });
            gameObjects.addObject("sign", {
                xPos : 5 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textXPos : 20,
                textYPos : -30,
                
                message : "Luckily if you've paying attention \n to the score board \n" + "you would know which levels these are.",
            });
            gameObjects.addObject("sign", {
                xPos : 6 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textXPos : 20,
                textYPos : -30,
                
                message : "Try to guess your way to victory...",
            });
            gameObjects.addObject("sign", {
                xPos : 7 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textXPos : 20,
                textYPos : -30,
                
                message : "Oh wait I almost forgot...",
            });
            gameObjects.addObject("sign", {
                xPos : 8 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textXPos : 20,
                textYPos : -30,
                textSize : 7,
                
                message : "there is a fourth possibility...",
            });
            gameObjects.addObject("sign", {
                xPos : 9 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                
                textXPos : 20,
                textYPos : -30,
                textSize : 7,
                
                message : "the \"End\"",
            });
            gameObjects.addObject("sign", {
                xPos : 10 * spacing, 
                yPos : 60, 
                width : 50, 
                height : 30, 
                message : "Good luck",
            });
                  
            gameObjects.addObject("block", {
                xPos : 0, 
                yPos : 115, 
                width : 1700, 
                height : 35, 
                color : color(0, 0, 255),
            });
        }
    },
    "maze" : {
        width : 2500,
        height : 2500,
        nextLevel : "End",
        backGround : function()
        {
            background(75, 175, 70);
            squares.draw();
        },
        load : function()
        {
            var backgroundColor = color(75, 175, 70);
            var nextLevel = "End";
            codeKeepers.add({
                code : ["UP", "UP", "RIGHT", "RIGHT", "RIGHT", "UP"],
            });
            squares.generate({
                amt : game.levelInfo.width * game.levelInfo.height / 80000,
                generate : function()
                {
                    var spacing = 9;
                    return {
                        xPos : random(0, game.levelInfo.width/spacing) * spacing,
                        yPos : random(0, game.levelInfo.height/spacing) * spacing,
                        width  : random(20, 50) * 2.3,
                        height : random(20, 50) * 2.3,
                        clusterAmt : random(2, 4),
                        block : function()
                        {
                            return {
                                xPos : random(-50, 50),
                                yPos : random(-50, 50),
                                width  : random(20, 50) * 2,
                                height : random(20, 50) * 2,
                                color : color(145, 
                                random(200, 255), random(0, 100), 100),
                            };
                        },
                    };
                },
            });
            gameObjects.addObject("player", {
                xPos : 300,//500,//350,//300, 
                yPos : 275,//400,//2200,//275, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            gameObjects.addObject("sign", {
                xPos : 215, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -30,
                
                message : "This is a maze. \nFollow the signs to the goal.\n              -->"
            });
            gameObjects.addObject("sign", {
                xPos : 815, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                
                message : "Go Down"
            });
            gameObjects.addObject("sign", {
                xPos : 815, 
                yPos : 760, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                
                message : "Go LEFT or RIGHT"
            });
            gameObjects.addObject("sign", {
                xPos : 115, 
                yPos : 760, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                
                message : "Go DOWN or UP"
            });
            gameObjects.addObject("sign", {
                xPos : 1700, 
                yPos : 800, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                
                message : "Go ???" 
            });
            gameObjects.addObject("sign", {
                xPos : 2000, 
                yPos : 800, 
                width : 50, 
                height : 30, 
                textXPos : -50,
                textYPos : -15,
                message : "You can't always trust the signs" 
            });
            gameObjects.addObject("sign", {
                xPos : 100, 
                yPos : 1200, 
                width : 50, 
                height : 30, 
                textXPos : -50,
                textYPos : -15,
                message : "Sometimes the path is unclear." 
            });
            gameObjects.addObject("sign", {
                xPos : 350, 
                yPos : 2200, 
                width : 50, 
                height : 30, 
                textXPos : -20,
                textYPos : -15,
                message : "Go RIGHT or UP" 
            });
            gameObjects.addObject("sign", {
                xPos : 400, 
                yPos : 500, 
                width : 50, 
                height : 30, 
                textXPos : -60,
                textYPos : -15,
                message : "UP, UP, RIGHT, RIGHT, RIGHT, UP" 
            });
            gameObjects.addObject("sign", {
                xPos : 100, 
                yPos : 2200, 
                width : 50, 
                height : 30, 
                textXPos : -50,
                textYPos : -20,
                message : "You made it through the first part! \n                   Go UP" 
            });
            gameObjects.addObject("sign", {
                xPos : 100, 
                yPos : 1750, 
                width : 50, 
                height : 30, 
                
                textXPos : -50,
                textYPos : -20,
                
                message : "Welcome to the first checkpoint!" 
            });
            gameObjects.addObject("sign", {
                xPos : 500, 
                yPos : 2450, 
                width : 50, 
                height : 30, 
                
                textXPos : -10,
                textYPos : -20,
                
                message : "This way -->" 
            });
            gameObjects.addObject("sign", {
                xPos : 1650, 
                yPos : 1800, 
                width : 50, 
                height : 30, 
                
                textXPos : -20,
                textYPos : -20,
                
                message : "Half way mark -->" 
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 0, 
                yPos : 369, 
                width : 600, 
                height : 30, 
                
                routeXPos : 215, 
                routeYPos : 260, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 1000, 
                yPos : 5, 
                width : 60, 
                height : 700, 
                
                routeObj : ["sign", 1],
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 730, 
                yPos : 900, 
                width : 800, 
                height : 40, 
                
                routeXPos : 830, 
                routeYPos : 80, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 1850, 
                yPos : 700, 
                width : 40, 
                height : 250, 
                
                routeObj : ["sign", 5],
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 2150, 
                yPos : 500, 
                width : 40, 
                height : 450, 
                
                routeObj : ["sign", 5],
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 1450, 
                yPos : 930, 
                width : 840, 
                height : 30, 
                
                routeObj : ["sign", 5], 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 1450, 
                yPos : 700, 
                width : 440, 
                height : 30, 
                
                routeObj : ["sign", 5],
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 1500, 
                yPos : 700, 
                width : 300, 
                height : 30, 
                
                routeObj : ["sign", 5],
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 450, 
                yPos : 1330, 
                width : 20, 
                height : 260, 
                
                routeXPos : 100, 
                routeYPos : 1300, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 260, 
                yPos : 930, 
                width : 30, 
                height : 200, 
                
                routeXPos : 650, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 700, 
                yPos : 930, 
                width : 20, 
                height : 200, 
                
                routeXPos : 300, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 500, 
                yPos : 1800, 
                width : 200, 
                height : 30, 
                
                routeYPos : 1000, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 290, 
                yPos : 1580, 
                width : 190, 
                height : 20, 
                
                routeObj : ["sign", 7], 
                
                onReroute : function()
                {
                    codeKeepers[0].updateCode("UP");
                },
                
                color : backgroundColor,
            });
            gameObjects.addObject("rerouterBlock", {
                xPos : 700, 
                yPos : 2100, 
                width : 20, 
                height : 280, 
                
                routeObj : ["sign", 7], 
                
                onReroute : function()
                {
                    codeKeepers[0].updateCode("RIGHT");
                },
                
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 1250, 
                yPos : 685, 
                width : 640, 
                height : 30, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 1050, 
                yPos : 500, 
                width : 40, 
                height : 205, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 900, 
                width : 550, 
                height : 30, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 1050, 
                yPos : 500, 
                width : 1140, 
                height : 40, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 930, 
                width : 40, 
                height : 400, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 0, 
                yPos : 1550, 
                width : 450, 
                height : 40, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 700, 
                yPos : 930, 
                width : 40, 
                height : 1450, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 1550, 
                width : 40, 
                height : 800, 
                color : color(0, 0, 0),
            });
            gameObjects.getArray("block").getLast().update = function()
            {
                if(codeKeepers[0].IsUnlocked())
                {
                    this.height = 600;
                }
            };
            gameObjects.addObject("block", {
                xPos : 450, 
                yPos : 1130, 
                width : 30, 
                height : 460, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 575, 
                yPos : 370, 
                width : 30, 
                height : 250, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 600, 
                width : 355, 
                height : 30, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 2355, 
                width : 500, 
                height : 40,
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 700, 
                yPos : 940, 
                width : 1600, 
                height : 40,
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 2175, 
                yPos : 500, 
                width : 40, 
                height : 450, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 2175, 
                yPos : 910, 
                width : 125, 
                height : 50, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 1050, 
                yPos : 5, 
                width : 60, 
                height : 500, 
                color : backgroundColor,
            });
            gameObjects.addObject("block", {
                xPos : 250, 
                yPos : 2350, 
                width : 480, 
                height : 40, 
                
                routeYPos : 950, 
                
                color : backgroundColor,
            });
            gameObjects.addObject("checkPoint", {
                xPos : 100,
                yPos : 1650,
                width : 30, 
                height : 50, 
            });
            /*gameObjects.addObject("checkPoint", {
                xPos : 1570,
                yPos : 1800,
                width : 30, 
                height : 50, 
            });*/
            gameObjects.addObject("hp", {
                xPos : 1570, 
                yPos : 1800, 
                width : 20, 
                height : 20, 
                amt : 50,
            });
            gameObjects.addObject("goal", {
                xPos : 1200,
                yPos : 300,
                width : 30, 
                height : 30, 
                level : nextLevel,
            });
            gameObjects.addObject("lava", {
                xPos : 1000, 
                yPos : 2115, 
                width : 60, 
                height : 600, 
                damage : 3,
                color : backgroundColor,
            });
            gameObjects.addObject("lavaBlock", {
                xPos : 1300, 
                yPos : 1415, 
                width : 60, 
                height : 600, 
                damage : 3,
                color : backgroundColor,
            });
            gameObjects.addObject("lava", {
                xPos : 1600, 
                yPos : 1000, 
                width : 60, 
                height : 600, 
                damage : 3,
                color : backgroundColor,
            });
            gameObjects.addObject("lava", {
                xPos : 740, 
                yPos : 1000, 
                width : 60, 
                height : 600, 
                damage : 4,
                color : backgroundColor,
            });
            gameObjects.addObject("lavaBlock", {
                xPos : 1700, 
                yPos : 2115, 
                width : 60, 
                height : 600, 
                damage : 3,
                color : backgroundColor,
            });
            gameObjects.addObject("lava", {
                xPos : 2000, 
                yPos : 1415, 
                width : 60, 
                height : 600, 
                damage : 2,
                color : backgroundColor,
            });
            gameObjects.addObject("lava", {
                xPos : 2300, 
                yPos : 1000, 
                width : 60, 
                height : 600, 
                damage : 2,
                color : backgroundColor,
            });
            gameObjects.addObject("lavaBlock", {
                xPos : 2500, 
                yPos : 2115, 
                width : 60, 
                height : 600, 
                damage : 2,
                color : backgroundColor,
            });
            for(var i = 0; i < 15; i++)
            {
                var val = round(random(1, 20));
                gameObjects.addObject("coin", {
                    xPos : random(0, 2500), 
                    yPos : random(0, 2500), 
                    width : val * 1.5, 
                    height : val * 1.5, 
                    amt : val,
                });
            }
        },
    },
    "End" : {
        width : width,
        height : height,
        backGround : function() 
        {
            background(75, 175, 70);
        },
        load : function()
        {
            gameObjects.addObject("player", {
                xPos : 300, 
                yPos : 275, 
                width : 30, 
                height : 30, 
                color : color(173, 40, 40)
            });
            gameObjects.addObject("sign", {
                xPos : 250, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                
                message : "You win!\n  <--"
            });
            gameObjects.addObject("sign", {
                xPos : 75, 
                yPos : 260, 
                width : 50, 
                height : 30, 
                
                textYPos : -15,
                textXPos : -10,
                
                message : "Game of Bricks 2 \nCreated by nitroByte!"
            });
            var getInput = function()
            { 
                var val = round(random(1, 20));
                return {
                    xPos : random(0, 400), 
                    yPos : random(0, 400), 
                    width : val * 1.5, 
                    height : val * 1.5, 
                    amt : val,
                };
            };
            for(var i = 0; i < 15; i++)
            {
                gameObjects.addObject("coin", getInput());
                gameObjects.addObject("hp", getInput());
            }
        }
    },
};

game.drawBackground = function()
{
    levels[game.levelInfo.level].backGround(); 
};
game.loop = function()
{
    pushMatrix();
        cam.view(gameObjects.getArray("player")[0]); 
        if(mouseIsPressed && mouseButton === RIGHT)
        {
            scale(0.2, 0.2);
            gameObjects.getArray("player")[0].xPos = mouseX * 10;
            gameObjects.getArray("player")[0].yPos = mouseY * 10;
        }
        game.drawBackground();
        gameObjects.draw();
        gameObjects.update();
        gameObjects.handleCollisions();
    popMatrix();
    textSize(12);
    textAlign(NORMAL);
    gameObjects.getArray("player")[0].stats();
};
game.menu = function()
{
    background(75, 175, 70);
    textSize(30);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0);
    text("Game of Bricks 2", 200, 75);
    if(mouseIsPressed)
    {
        if(IsMouseInside(buttons.getButton("play")))
        {
            this.changeGameState("play");
        }
        if(IsMouseInside(buttons.getButton("how-to")))
        {
            this.changeGameState("how-to");
        }
    }
};
game.howTo = function()
{
    background(75, 175, 70);
    textSize(15);
    textAlign(CENTER, CENTER);
    text("Use the arrow keys to move and use the space \n bar to activate something. \n The 'p' key pauses the game.", 200, 150);
    
    if(mouseIsPressed)
    {
        if(IsMouseInside(buttons.getButton("menu")))
        {
            this.changeGameState("menu");
        }
    }
};
game.paused = function()
{
    image(this.playImg, 0, 0);
    fill(0, 0, 0, 50);
    rect(50, 0, 300, 400);
    fill(0, 0, 0);
    textSize(40);
    textAlign(CENTER);
    text("Paused", 200, 115);
    if(mouseIsPressed)
    {
        if(IsMouseInside(buttons.getButton("resume")))
        {
            this.changeGameState("play");
        }
        if(IsMouseInside(buttons.getButton("restart")))
        {
            this.changeLevel(this.levelInfo.level);
            this.changeGameState("play");
        }
        if(IsMouseInside(buttons.getButton("menu")))
        {
            this.changeGameState("menu");
        }
    }
};
game.keyPressed = function()
{
    if(keys[80])
    {
        if(this.gameStateInfo.gameState === "play")
        {
            this.changeGameState("paused");
        }else
        if(this.gameStateInfo.gameState === "paused")
        {
            this.changeGameState("play");
        }
    }
};
game.update = function()
{
    switch(this.gameStateInfo.gameState)
    {
        case "menu" :
                this.menu();
            break;
        
        case "play" : 
                this.loop();
            break;
            
        case "how-to" : 
                this.howTo();
            break;
            
        case "paused" :
                this.paused();
            break;
    }
};
game.changeGameState = function(gameState)
{
    buttons.clear();
    switch(gameState)
    {
        case "menu" :
                buttons.addButton({
                    xPos : 200 - 100/2,
                    yPos : 175,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "play",
                    message : "Play",
                });
                buttons.addButton({
                    xPos : 200 - 100/2,
                    yPos : 220,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "how-to",
                    message : "How-to",
                });
            break;
        
        case "play" : 
            break;
         
        case "how-to" :
                buttons.addButton({
                    xPos : 0,
                    yPos : 370,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "menu",
                    message : "Menu",
                });
            break;
            
        case "paused" : 
                this.playImg = get(0, 0, width, height);
                buttons.addButton({
                    xPos : 200 - 100/2,
                    yPos : 175,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "resume",
                    message : "Resume",
                });
                buttons.addButton({
                    xPos : 200 - 100/2,
                    yPos : 220,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "restart",
                    message : "Restart",
                });
                buttons.addButton({
                    xPos : 200 - 100/2,
                    yPos : 265,
                    width : 100,
                    height : 30,
                    color : color(0, 0, 0, 100),
                    name : "menu",
                    message : "Menu",
                });
            break;
    }
    this.gameStateInfo.gameState = gameState;
};
game.changeLevel = function(level, objs)
{
    this.levelInfo.level = level;
    gameObjects.removeObjects();
    codeKeepers.clear();
    this.levelInfo.width = levels[this.levelInfo.level].width;
    this.levelInfo.height = levels[this.levelInfo.level].height;
    levels[this.levelInfo.level].load();
    gameObjects.replaceObjects(objs || []);
};
game.saveScore = function()
{
    if(gameObjects.getArray("player") !== undefined)
    {
        var obj = gameObjects.getArray("player")[0];
        game.barInfo.coins += obj.coins;
        game.barInfo.score += obj.score;
    }
};
game.setup = function()
{
    this.changeGameState("menu");
    this.changeLevel("intro");
};

game.setup();
draw = function() 
{
    game.update();
    buttons.draw();
};


    }
    if (typeof draw !== 'undefined') processing.draw = draw;
});