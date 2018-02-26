window.onload = function() {
   var WAR_RADIUS = 10;
   var INIT_ORIENT_TOP = 270 * Math.PI / 180;
   var INIT_ORIENT_BOT =  90 * Math.PI/180;
   var INIT_WEAPON_LEN = 40;
   var INIT_SPACING = 2;
   var WEP_TYPE_AXE = 0;
   var WEP_TYPE_SPEAR = 1;
   var WEP_TYPE_SWORD = 2;
   var WEP_TYPE_NO_WEP = 3;
   var MOVE_CHECK_NUM = 10;
   var DRAW_INTERVAL = 10;
   var TIMEOUT = 10 * 1000;

   var intID = -1;

   var START_BUTTON = document.getElementById("startButton");
   var STOP_BUTTON = document.getElementById("stopButton");
   var STATS_BUTTON = document.getElementById("statsButton");
   var CANVAS = document.getElementById("simCanvas");
   var RUN_RESULTS = document.getElementById("runResults");

   var running = false;
   //TODO NEED TO RESET TO 0 AT EACH RUN!
   var steps = 0;



   START_BUTTON.onclick = function() {
      running = true;
      if (intID < 0) {
         intID = setInterval(draw, DRAW_INTERVAL);
      }

   };

   STOP_BUTTON.onclick = function () {
      if (intID >= 0) {
         clearInterval(intID);
         intID = -1;
      }
      running = false;
   };

   var ctx = CANVAS.getContext("2d");
	var canvasWidth = CANVAS.width;
	var canvasHeight = CANVAS.height;

   console.log("width = %d\n", canvasWidth);
   console.log("height = %d\n", canvasHeight);

   var warriorsTop = createArmy(INIT_WEAPON_LEN, true, "white", INIT_ORIENT_TOP, WEP_TYPE_SPEAR, 2);
   var warriorsBot = createArmy(20, false, "grey", INIT_ORIENT_BOT, WEP_TYPE_SPEAR, 2);


   function Warrior(x, y, color, radius, orientation, weaponLen, speed, id, wepType, isTop) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = radius;
      this.orientation = orientation;
      this.weaponLen = weaponLen;
      this.speed = speed;
      this.isAlive = true;
      this.id = id;
      this.weaponType = wepType;
      this.isTop = isTop;


      this.draw = function() {
         if (this.isAlive) {
            //Drawing body
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "black";
            ctx.stroke();
            //Draw weapon

            ctx.beginPath();
            var convert = 2 * Math.PI - this.orientation;
            var wepDelt = Math.PI - convert;
            var wepX;
            var wepY;
            var wepEndX;
            var wepEndY;
            if (convert >= 180 * Math.PI / 180) {
               if (this.orientation <= 90 * Math.PI/ 180) {
                  wepDelt = Math.abs(this.orientation - 90 * Math.PI / 180);
                  wepX = Math.cos(wepDelt) * this.radius + this.x;
                  wepY = Math.sin(wepDelt) * this.radius + this.y;
               }
               else {
                  wepDelt = convert + 90 * Math.PI/ 180;
                  wepX = Math.cos(wepDelt) * this.radius + this.x;
                  wepY = Math.sin(wepDelt) * this.radius + this.y;
               }
               wepEndX = Math.cos(convert) * this.weaponLen + wepX;
               wepEndY = Math.sin(convert) * this.weaponLen + wepY;

            }
            else {
               if (convert <= 90 * Math.PI / 180) {
                  wepX = Math.cos(wepDelt + convert) * this.radius + this.x;
                  wepY = Math.sin(wepDelt + convert) * this.radius + this.y;
               }
               else {
                  wepX = Math.cos(convert + 90 * Math.PI / 180) * this.radius + this.x;
                  wepY = Math.sin(convert + 90 * Math.PI / 180) * this.radius + this.y;
               }
               wepEndX = Math.cos(convert) * this.weaponLen + wepX;
               wepEndY = Math.sin(convert) * this.weaponLen + wepY;
            }
            //console.log("Wep delt %d orient %d X %d Y %d WEPX %d WEPY %d\n", wepDelt * 180 / Math.PI, this.orientation * 180 / Math.PI, this.x, this.y, wepX, wepY);
            ctx.moveTo(wepX, wepY);

            //console.log("x = %d y = %d\n", Math.cos(this.orientation), Math.sin(this.orientation));
            //console.log("x = %d y = %d\n", xWep, yWep);
            ctx.lineTo(wepEndX, wepEndY);
            ctx.lineWidth = 2;
            ctx.stroke();
         }
      }

      this.willMove = function() {
         return true;
      }

      this.move = function() {
         var i = 0;
         var origOrientation = this.orientation;
         while (i < MOVE_CHECK_NUM) {
            var xSpeed = Math.cos(360 * Math.PI / 180 - this.orientation) * this.speed;
            var ySpeed = Math.sin(360 * Math.PI / 180 - this.orientation) * this.speed;
            var newX = this.x + xSpeed;
            var newY = this.y + ySpeed;
            var edge = false;

            if (!checkBodyCollision(newX, newY, this.radius, this.id)){
               if (!checkKillOwn(newX, newY, this.radius, this.id, this.orientation, this.weaponLen, this.weaponType, this.isTop)) {
                  if (newY + this.radius < canvasHeight && newY - this.radius > 0 && newX + this.radius < canvasWidth && newX - this.radius > 0) {
                     this.y = this.y + ySpeed;
                     this.x = this.x + xSpeed;
                     i = MOVE_CHECK_NUM;
                  }
                  else {
                     edge = true;
                  }

               }
            }
            if (i > 0 && i < MOVE_CHECK_NUM) {
               if (edge) {
                  this.orientation = 360 * Math.PI / 180 - (this.orientation + Math.random(15 * Math.PI / 180));
               }
               else {
                  this.orientation = Math.random(360 * Math.PI / 180);
               }
            }
            i = i + 1;
         }
         if (i != MOVE_CHECK_NUM + 1) {
            this.orientation = origOrientation;
         }
      }

      this.update = function() {
         if (this.isAlive) {
            if (checkIsDead(this.x, this.y, this.radius, this.id)) {
               this.isAlive = false;
               return
            }
            if (this.willMove()) {
               this.move();
            }

            if (checkIsDead(this.x, this.y, this.radius, this.id)) {
               this.isAlive = false;
               return
            }
         }
      }
   }

   function createArmy(weaponLen, isTop, color, orient, weaponType, speed) {
      var numXWar = Math.floor(canvasWidth / (WAR_RADIUS *2 + weaponLen + INIT_SPACING)) - 1;
      var numYWar = Math.floor((canvasHeight / 3) / (WAR_RADIUS *2 + weaponLen + INIT_SPACING));
      var warriors = [];
      var numWars = 0;

      for (var i = 0; i < numYWar; i++) {
         for (var j = 0; j < numXWar; j++) {
            var xCord;
            var yCord;
            xCord = (WAR_RADIUS * 2 + INIT_SPACING) * (j + 1) + weaponLen * j;
            if (isTop) {
               yCord = (WAR_RADIUS * 2 + INIT_SPACING) * (i + 1) + weaponLen * i;
            }
            else {
               yCord = ((WAR_RADIUS * 2 + INIT_SPACING) * (i + 1) + weaponLen * i) + (canvasHeight / 3) * 2;
            }
            //console.log("xCord %d yCord = %d\n", xCord, yCord);
            warriors[numWars] = new Warrior(xCord, yCord, color, WAR_RADIUS, orient, weaponLen, speed, numWars, weaponType, isTop);
            numWars += 1;
         }
      }
      return warriors
   }

   function draw() {
      ctx.globalCompositeOperator = "source-over";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      var topDead = 0;
      var botDead = 0;

      for (var i = 0; i < warriorsTop.length; i++) {
         if (warriorsTop[i].isAlive) {
            warriorsTop[i].update();
            warriorsTop[i].draw();
         }
         else {
            topDead += 1;
         }
      }
      if (topDead == warriorsTop.length) {
         botWins();
      }
      for (var i = 0; i < warriorsBot.length; i++) {
         if (warriorsBot[i].isAlive) {
            warriorsBot[i].update();
            warriorsBot[i].draw();
         }
         else {
            botDead += 1;
         }
      }
      if (botDead == warriorsBot.length) {
         topWins();
      }

      if (steps == TIMEOUT / DRAW_INTERVAL) {
         console.log("BOT DEAD = %d TOP DEAD = %d\n", botDead, topDead);
         if ((warriorsBot.length - botDead) / warriorsBot.length > (warriorsTop - topDead) / warriorsTop.length) {
            botWins();
         }
         else {
            topWins();
         }
      }
      else {
         steps++;
      }
   }

   function botWins() {
      clearInterval(intID);
      intID = -1;
      RUN_RESULTS.innerText = "BOTTOM CLAN WON!!!";
   }

   function topWins() {
      clearInterval(intID);
      intID = -1;
      RUN_RESULTS.innerText = "TOP CLAN WON!!!";
   }


   function checkIsDead(xPos, yPos, radius, id) {
      var leftXPos = xPos - radius;
      var rightXPos = xPos + radius;
      var topYPos = yPos - radius;
      var botYPos = yPos + radius;
      for (var i = 0; i < warriorsTop.length; i++) {
         if (warriorsTop[i].isAlive && id != warriorsTop[i].id) {
            if (warriorsTop[i].weaponType == WEP_TYPE_SPEAR) {
               var orient = warriorsTop[i].orientation;
               var warRad = warriorsTop[i].radius;
               var warX = warriorsTop[i].x;
               var warY = warriorsTop[i].y;
               var warWepLen = warriorsTop[i].weaponLen;
               var convert = 2 * Math.PI - orient;
               var wepDelt = Math.PI - convert;
               var wepX;
               var wepY;
               var wepEndX;
               var wepEndY;
               if (convert >= 180 * Math.PI / 180) {
                  if (orient <= 90 * Math.PI/ 180) {
                     wepDelt = Math.abs(orient - 90 * Math.PI / 180);
                     wepX = Math.cos(wepDelt) * warRad + warX;
                     wepY = Math.sin(wepDelt) * warRad + warY;
                  }
                  else {
                     wepDelt = convert + 90 * Math.PI/ 180;
                     wepX = Math.cos(wepDelt) * warRad + warX;
                     wepY = Math.sin(wepDelt) * warRad + warY;
                  }
                  wepEndX = Math.cos(convert) * warWepLen + wepX;
                  wepEndY = Math.sin(convert) * warWepLen + wepY;

               }
               else {
                  if (convert <= 90 * Math.PI / 180) {
                     wepX = Math.cos(wepDelt + convert) * warRad + warX;
                     wepY = Math.sin(wepDelt + convert) * warRad + warY;
                  }
                  else {
                     wepX = Math.cos(convert + 90 * Math.PI / 180) * warRad + warX;
                     wepY = Math.sin(convert + 90 * Math.PI / 180) * warRad + warY;
                  }
                  wepEndX = Math.cos(convert) * warWepLen + wepX;
                  wepEndY = Math.sin(convert) * warWepLen + wepY;
               }
               //console.log("left X %d right X %d top Y %d bot Y %d x %d y %d\n", leftXPos, rightXPos, topYPos, botYPos, xWep, yWep);
               if (leftXPos <= wepEndX && wepEndX <= rightXPos) {
                  if (topYPos < wepEndY && wepEndY < botYPos) {
                     return true;
                  }
               }
            }
         }
      }
      for (var i = 0; i < warriorsBot.length; i++) {
         if (warriorsBot[i].isAlive && id != warriorsBot[i].id) {
            if (warriorsBot[i].weaponType == WEP_TYPE_SPEAR) {
               var orient = warriorsBot[i].orientation;
               var warRad = warriorsBot[i].radius;
               var warX = warriorsBot[i].x;
               var warY = warriorsBot[i].y;
               var warWepLen = warriorsBot[i].weaponLen;
               var convert = 2 * Math.PI - orient;
               var wepDelt = Math.PI - convert;
               var wepX;
               var wepY;
               var wepEndX;
               var wepEndY;
               if (convert >= 180 * Math.PI / 180) {
                  if (orient <= 90 * Math.PI/ 180) {
                     wepDelt = Math.abs(orient - 90 * Math.PI / 180);
                     wepX = Math.cos(wepDelt) * warRad + warX;
                     wepY = Math.sin(wepDelt) * warRad + warY;
                  }
                  else {
                     wepDelt = convert + 90 * Math.PI/ 180;
                     wepX = Math.cos(wepDelt) * warRad + warX;
                     wepY = Math.sin(wepDelt) * warRad + warY;
                  }
                  wepEndX = Math.cos(convert) * warWepLen + wepX;
                  wepEndY = Math.sin(convert) * warWepLen + wepY;

               }
               else {
                  if (convert <= 90 * Math.PI / 180) {
                     wepX = Math.cos(wepDelt + convert) * warRad + warX;
                     wepY = Math.sin(wepDelt + convert) * warRad + warY;
                  }
                  else {
                     wepX = Math.cos(convert + 90 * Math.PI / 180) * warRad + warX;
                     wepY = Math.sin(convert + 90 * Math.PI / 180) * warRad + warY;
                  }
                  wepEndX = Math.cos(convert) * warWepLen + wepX;
                  wepEndY = Math.sin(convert) * warWepLen + wepY;
               }
               //console.log("left X %d right X %d top Y %d bot Y %d x %d y %d\n", leftXPos, rightXPos, topYPos, botYPos, xWep, yWep);
               if (leftXPos <= wepEndX && wepEndX <= rightXPos) {
                  if (topYPos < wepEndY && wepEndY < botYPos) {
                     return true;
                  }
               }
            }
         }
      }
   }

   function checkKillOwn(xPos, yPos, radius, id, orientation, wepLen, wepType, isTop) {
      var convert = 2 * Math.PI - orientation;
      var wepDelt = Math.PI - convert;
      var wepX;
      var wepY;
      var wepEndX;
      var wepEndY;
      if (convert >= 180 * Math.PI / 180) {
         if (orientation <= 90 * Math.PI/ 180) {
            wepDelt = Math.abs(orientation - 90 * Math.PI / 180);
            wepX = Math.cos(wepDelt) * radius + xPos;
            wepY = Math.sin(wepDelt) * radius + yPos;
         }
         else {
            wepDelt = convert + 90 * Math.PI/ 180;
            wepX = Math.cos(wepDelt) * radius + xPos;
            wepY = Math.sin(wepDelt) * radius + yPos;
         }
         wepEndX = Math.cos(convert) * wepLen + wepX;
         wepEndY = Math.sin(convert) * wepLen + wepY;

      }
      else {
         if (convert <= 90 * Math.PI / 180) {
            wepX = Math.cos(wepDelt + convert) * radius + xPos;
            wepY = Math.sin(wepDelt + convert) * radius + yPos;
         }
         else {
            wepX = Math.cos(convert + 90 * Math.PI / 180) * radius + xPos;
            wepY = Math.sin(convert + 90 * Math.PI / 180) * radius + yPos;
         }
         wepEndX = Math.cos(convert) * wepLen + wepX;
         wepEndY = Math.sin(convert) * wepLen + wepY;
      }
      if (isTop) {
         for (var i = 0; i < warriorsTop.length; i++) {
            if (warriorsTop[i].isAlive && id != warriorsTop[i].id) {
               if (wepType == WEP_TYPE_SPEAR) {
                  var xPosComp = warriorsTop[i].x;
                  var yPosComp = warriorsTop[i].y;
                  var leftXPos = xPosComp - warriorsTop[i].radius;
                  var rightXPos = xPosComp + warriorsTop[i].radius;
                  var topYPos = yPosComp - warriorsTop[i].radius;
                  var botYPos = yPosComp + warriorsTop[i].radius;
                  //console.log("left X %d right X %d top Y %d bot Y %d x %d y %d\n", leftXPos, rightXPos, topYPos, botYPos, xWep, yWep);
                  if (leftXPos <= wepEndX&& wepEndX <= rightXPos) {
                     if (topYPos < wepEndY && wepEndY < botYPos) {
                        return true;
                     }
                  }
               }
            }
         }
      }
      else {
         for (var i = 0; i < warriorsBot.length; i++) {
            if (warriorsBot[i].isAlive && id != warriorsBot[i].id) {
               if (wepType == WEP_TYPE_SPEAR) {
                  var xPosComp = warriorsBot[i].x;
                  var yPosComp = warriorsBot[i].y;
                  var leftXPos = xPosComp - warriorsBot[i].radius;
                  var rightXPos = xPosComp + warriorsBot[i].radius;
                  var topYPos = yPosComp - warriorsBot[i].radius;
                  var botYPos = yPosComp + warriorsBot[i].radius;
                  //console.log("left X %d right X %d top Y %d bot Y %d x %d y %d\n", leftXPos, rightXPos, topYPos, botYPos, xWep, yWep);
                  if (leftXPos <= wepEndX && wepEndX <= rightXPos) {
                     if (topYPos < wepEndX && wepEndX < botYPos) {
                        return true;
                     }
                  }
               }
            }
         }
      }

   }

   function checkBodyCollision(xPos, yPos, radius, id) {
      var leftXPos = xPos - radius;
      var rightXPos = xPos + radius;
      var topYPos = yPos - radius;
      var botYPos = yPos + radius;
      for (var i = 0; i < warriorsTop.length; i++) {
         if (warriorsTop[i].isAlive && id != warriorsTop[i].id) {
            var xPosComp = warriorsTop[i].x;
            var yPosComp = warriorsTop[i].y;
            var leftXPosComp = xPosComp - warriorsTop[i].radius;
            var rightXPosComp = xPosComp + warriorsTop[i].radius;
            var topYPosComp = yPosComp - warriorsTop[i].radius;
            var botYPosComp = yPosComp + warriorsTop[i].radius;

            if (leftXPos < rightXPosComp && rightXPosComp < rightXPos) {
               if (topYPos < botYPosComp && botYPosComp < botYPos) {
                  return true;
               }
               if (topYPos < topYPosComp && topYPosComp < botYPos) {
                  return true;
               }
            }
            if (leftXPos < leftXPosComp && leftXPosComp < rightXPos) {
               if (topYPos < botYPosComp && botYPosComp < botYPos) {
                  return true;
               }
               if (topYPos < topYPosComp && topYPosComp < botYPos) {
                  return true;
               }
            }


         }
      }
      for (var i = 0; i < warriorsBot.length; i++) {
         if (warriorsBot[i].isAlive && id != warriorsBot[i].id) {
            var xPosComp = warriorsBot[i].x;
            var yPosComp = warriorsBot[i].y;
            var leftXPosComp = xPosComp - warriorsBot[i].radius;
            var rightXPosComp = xPosComp + warriorsBot[i].radius;
            var topYPosComp = yPosComp - warriorsBot[i].radius;
            var botYPosComp = yPosComp + warriorsBot[i].radius;

            if (leftXPos < rightXPosComp && rightXPosComp < rightXPos) {
               if (topYPos < botYPosComp && botYPosComp < botYPos) {
                  return true;
               }
               if (topYPos < topYPosComp && topYPosComp < botYPos) {
                  return true;
               }
            }
            if (leftXPos <= leftXPosComp && leftXPosComp <= rightXPos) {
               if (topYPos < botYPosComp && botYPosComp < botYPos) {
                  return true;
               }
               if (topYPos < topYPosComp && topYPosComp < botYPos) {
                  return true;
               }
            }
         }
      }
      return false;
   }

   ctx.globalCompositeOperator = "source-over";
   ctx.fillStyle = "white";
   ctx.fillRect(0, 0, canvasWidth, canvasHeight);

   for (var i = 0; i < warriorsTop.length; i++) {
      warriorsTop[i].draw();

   }
   for (var i = 0; i < warriorsBot.length; i++) {
      warriorsBot[i].draw();

   }



}
