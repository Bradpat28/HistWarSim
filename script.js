window.onload = function() {
   var WAR_RADIUS = 10;
   var INIT_ORIENT_TOP = 270 * Math.PI / 180;
   var INIT_ORIENT_BOT =  0 * Math.PI/180;
   var INIT_WEAPON_LEN = 30;
   var INIT_SPACING = 2;
   var WEP_TYPE_AXE = 0;
   var WEP_TYPE_SPEAR = 1;
   var WEP_TYPE_SWORD = 2;

   var intID = -1;

   var startButton = document.getElementById("startButton");
   var stopButton = document.getElementById("stopButton");
   var statsButton = document.getElementById("statsButton");
   var canvas = document.getElementById("simCanvas");

   var running = false;

   startButton.onclick = function() {
      running = true;
      if (intID < 0) {
         intID = setInterval(draw, 10);
      }

   };

   stopButton.onclick = function () {
      if (intID >= 0) {
         clearInterval(intID);
         intID = -1;
      }
      running = false;
   };

   var ctx = canvas.getContext("2d");
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

   console.log("width = %d\n", canvasWidth);
   console.log("height = %d\n", canvasHeight);




   var warriorsTop = createArmy(INIT_WEAPON_LEN, true, "white", INIT_ORIENT_TOP, WEP_TYPE_SPEAR, 2);
   var warriorsBot = createArmy(INIT_WEAPON_LEN, false, "grey", INIT_ORIENT_BOT, WEP_TYPE_SPEAR, 2);


   function Warrior(x, y, color, radius, orientation, weaponLen, speed, id, wepType) {
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
                  console.log("ASDFASDFASDF");
                  wepX = Math.cos(convert + 90) * this.radius + this.x;
                  wepY = Math.sin(convert + 90) * this.radius + this.y;
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

      this.whereMoveX = function() {

      }

      this.whereMoveY = function() {

      }

      this.update = function() {
         if (checkIsDead(this.x, this.y, this.radius, this.id)) {
            this.isAlive = false;
            return
         }
         //this.orientation = Math.random(2 * Math.PI);
         var xSpeed = Math.cos(360 * Math.PI / 180 - this.orientation) * this.speed;
         var ySpeed = Math.sin(360 * Math.PI/ 180 - this.orientation) * this.speed;
         if (this.orientation == 0) {

            console.log("Xspeed = %d Yspeed = %d\n", xSpeed, ySpeed);
         }

         //var xSpeed = this.speed;
         //var ySpeed = this.speed;
         var newX = this.x + xSpeed;
         var newY = this.y + ySpeed;
         var dX = 0;
         var dY = 0;

         if (!checkBodyCollision(newX, newY, this.radius, this.id)) {
            if (newX + this.radius <= canvasWidth && newX - this.radius >= 0) {
               dX = newX - this.x;
               this.x = this.x + xSpeed;
            }
            if (newY + this.radius <= canvasHeight && newY - this.radius >= 0) {
               dY = newY - this.y;
               this.y = this.y + ySpeed;
            }
         }
         /*if (dX == 0) {
            if (dY > 0) {
               this.orientation = 3 * Math.PI / 2;
            }
            else if (dY < 0) {
               this.orientation = Math.PI / 2;
            }
         }
         else if (dY == 0) {
            if(dX > 0) {
               this.orientation =  0;
            }
            else if (dX < 0) {
               this.orientation = Math.PI;
            }
         }
         else {
            //console.log("Orientation %d\n", this.orientation);
            //console.log(dY/dX);
            this.orientation = Math.tan(dY/dX);
            //console.log("Orientation %d\n", this.orientation);
         }*/
         if (checkIsDead(this.x, this.y, this.radius, this.id)) {
            this.isAlive = false;
            return
         }
      }
   }

   function drawWeapon(x, y, orientation, radius, weaponLen) {

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
            warriors[numWars] = new Warrior(xCord, yCord, color, WAR_RADIUS, orient, weaponLen, speed, numWars, weaponType);
            numWars += 1;
         }
      }
      return warriors
   }

   function draw() {
      ctx.globalCompositeOperator = "source-over";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      for (var i = 0; i < warriorsTop.length; i++) {
         if (warriorsTop[i].isAlive) {
            warriorsTop[i].update();
            warriorsTop[i].draw();
         }


      }
      for (var i = 0; i < warriorsBot.length; i++) {
         if (warriorsBot[i].isAlive) {
            warriorsBot[i].update();
            warriorsBot[i].draw();
         }
      }
   }

   function checkIsDead(xPos, yPos, radius, id) {
      var leftXPos = xPos - radius;
      var rightXPos = xPos + radius;
      var topYPos = yPos - radius;
      var botYPos = yPos + radius;
      for (var i = 0; i < warriorsTop.length; i++) {
         if (warriorsTop[i].isAlive && id != warriorsTop[i].id) {
            if (warriorsTop[i].weaponType == WEP_TYPE_SPEAR) {
               var xWep = warriorsTop[i].x + Math.cos(2 * Math.PI - warriorsTop[i].orientation) * (warriorsTop[i].radius + warriorsTop[i].weaponLen);
               var yWep = warriorsTop[i].y + Math.sin(2 * Math.PI - warriorsTop[i].orientation) * (warriorsTop[i].radius + warriorsTop[i].weaponLen);
               //console.log("left X %d right X %d top Y %d bot Y %d x %d y %d\n", leftXPos, rightXPos, topYPos, botYPos, xWep, yWep);
               if (leftXPos <= xWep && xWep <= rightXPos) {
                  if (topYPos < yWep && yWep < botYPos) {
                     console.log("%d is DEAD\n", id);
                     return true;
                  }
               }
            }
         }
      }
      for (var i = 0; i < warriorsBot.length; i++) {
         if (warriorsBot[i].isAlive && id != warriorsBot[i].id) {
            if (warriorsBot[i].weaponType == WEP_TYPE_SPEAR) {
               var xWep = warriorsBot[i].x +Math.cos(2 * Math.PI - warriorsBot[i].orientation) * (warriorsBot[i].radius + warriorsBot[i].weaponLen);
               var yWep = warriorsBot[i].y +Math.sin(2 * Math.PI - warriorsBot[i].orientation) * (warriorsBot[i].radius + warriorsBot[i].weaponLen);
               if (leftXPos <= xWep && xWep <= rightXPos) {
                  if (topYPos < yWep && yWep < botYPos) {
                     console.log("%d is DEAD\n");
                     return true;
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

            if (leftXPos <= rightXPosComp && rightXPosComp <= rightXPos) {
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
