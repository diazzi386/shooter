var Colors = {
    white: "#FFFFFF",
    black: "#000000",
    red: "#D32F2F",
    pink: "#FF4081",
    purple: "#7B1FA2",
    deeppurple: "#7C4DFF",
    indigo: "#303F9F",
    blue: "#448AFF",
    lightblue: "#0288D1",
    cyan: "#00BCD4",
    teal: "#00796B",
    green: "#4CAF50",
    lightgreen: "#689F38",
    lime: "#CDDC39",
    yellow: "#FFEB3B",
    amber: "#FBC02D",
    orange: "#FF9800",
    deeporange: "#E64A19",
    brown: "#5D4037",
    grey: "#9E9E9E",
    bluegrey: "#455A64"
};

var DEBUG = false;

var Shooter = {
    init: function () {
        Mouse.init();
        Keyboard.init();
        Clock.init();
        Player.init();
        Bullets = [];
        Targets = [];
        
        Shooter.loop();
    }, loop: function () {
        Player.move();
        Clock.tick();
        Render.render();

        requestAnimationFrame(Shooter.loop);
    }
};

var Stats = {
    score: 0,
    reloads: 0,
    fired: 0,
    accuracy: 0,
};

var Targets = [];

var Bullets = [];

var Player = {
    position: {
        x: 0,
        y: 0
    }, magazine: {
        bullets: 0
    },
    gun: 0,
    firing: 0,
    init: function () {
        Player.reload();
    }, move: function () {
        Player.position.x = Mouse.position.x - 0.5 * document.body.offsetWidth;
        Player.position.y = 0.5 * document.body.offsetHeight - Mouse.position.y;
    }, reload: function () {
        Player.magazine.bullets = Guns[GunsList[Player.gun]].magazine;
        Stats.reloads += 1;
    }, changeGun: function () {
        Player.gun = (Player.gun + 1) % GunsList.length;
        Player.reload();
    }, fire: function () {
        if (Player.magazine.bullets <= 0) {
            Player.stop();
            Player.reload();
            return;
        }

        var bullet_x = -1 * Player.position.x + Guns[GunsList[Player.gun]].spray * (Math.random() - 0.5);
        var bullet_y = -1 * Player.position.y + Guns[GunsList[Player.gun]].spray * (Math.random() - 0.5);
        var bullet_a = Math.max(0, 1 - Math.sqrt(bullet_x * bullet_x + bullet_y * bullet_y)/50);

        Bullets.push(
            {
                x: bullet_x,
                y: bullet_y,
                accuracy: bullet_a,
                size: Guns[GunsList[Player.gun]].size
            }
        );

        Player.magazine.bullets -= 1;

        Stats.fired += 1;
        Stats.accuracy = (Stats.accuracy * (Stats.fired - 1) + bullet_a) / Stats.fired;
        
        if (bullet_a >= 0.95)
            Stats.score += 100;
        else if (bullet_a >= 0.9)
            Stats.score += 50;
        else if (bullet_a >= 0.7)
            Stats.score += 20;
        else if (bullet_a >= 0.5)
            Stats.score += 10;
        else if (bullet_a > 0)
            Stats.score += 5;

        if (Guns[GunsList[Player.gun]].fire == "auto" && Player.magazine.bullets > 0)
            Player.firing = window.setTimeout(Player.fire, Guns[GunsList[Player.gun]].rate);
    }, stop: function () {
        window.clearTimeout(Player.firing);
    }
};

var Guns = {
    "pistol": {
        magazine: 9,
        fire: "semi",
        size: 5,
        spray: 20
    }, "shotgun": {
        magazine: 2,
        fire: "bolt",
        size: 15,
        spray: 100
    }, "rifle": {
        magazine: 7,
        fire: "bolt",
        size: 8,
        spray: 5
    }, "machine gun": {
        magazine: 25,
        fire: "auto",
        rate: 100,
        size: 3,
        spray: 35
    }, "assault rifle": {
        magazine: 20,
        fire: "auto",
        rate: 150,
        size: 5,
        spray: 25
    }, ".50 cal sniper rifle": {
        magazine: 1,
        fire: "bolt",
        size: 10,
        spray: 5
    }
};

GunsList = [
    "pistol", "shotgun", "rifle", "machine gun", "assault rifle", ".50 cal sniper rifle"
];

var Mouse = {
    position: {
        x: 0,
        y: 0,
    }, init: function () {
        /*
		document.getElementById('shooter').addEventListener('pointerdown', Player.fire);
		document.getElementById('shooter').addEventListener('pointerup', Player.stop);
        document.getElementById('shooter').addEventListener('pointermove', Mouse.move);
        */
		document.addEventListener('pointerdown', Player.fire);
		document.addEventListener('pointerup', Player.stop);
        document.addEventListener('pointermove', Mouse.move);
	}, move: function (event) {
        Mouse.position.x = event.pageX;
        Mouse.position.y = event.pageY;
    }
};

var Keyboard = {
    init: function () {
        document.addEventListener('keydown', Keyboard.choose);
    }, choose: function (event) {
        event.preventDefault ? event.preventDefault() : false;
        if (event.key == "r")
            Player.reload();
        else if (event.key == " ")
            Player.changeGun();
        else if (event.key == "n")
            Shooter.init();
        else if (event.key == "'")
            DEBUG = !DEBUG;
    }
}

var Clock = {
    started: 0,
    elapsed: 0,
    init: function () {
        Clock.started = new Date().getTime();
    }, tick: function () {
        Clock.elapsed = new Date().getTime() - Clock.started;
    }
}

var Memory = {
	values: {},
	write: function (n, v) {
		if (v == undefined)
			return;
		Memory.values[n] = v;
		v = JSON.stringify(v);
		IO.verbose("Variable set: " + n.toUpperCase() + " to " + v);
	}, read: function (n) {
		if (Memory.values[n] == undefined)
			IO.error("Variable not found: " + n.toUpperCase());
		else
			return Memory.values[n];
	}, load: function (e) {
		for (var i in e)
			Memory.values[i] = e[i];
	}, save: function () {
		localStorage.setItem(Game.Key, JSON.stringify(Memory.values));
	}, saved: function () {
		if (localStorage.getItem(Game.Key))
			return true;
		else
			return false;
	}, resume: function () {
		var m = JSON.parse(localStorage.getItem(Game.Key));
		Memory.load(m);
	}, reset: function () {
		localStorage.removeItem(Game.Key);
	}
};

var Render = {
    render: function () {
        var canvas = document.getElementById("shooter");
        var context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = Colors.red;
        context.beginPath();
        context.arc(300 - Player.position.x, 225 + Player.position.y, 50, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = Colors.white;
        context.beginPath();
        context.arc(300 - Player.position.x, 225 + Player.position.y, 40, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = Colors.red;
        context.beginPath();
        context.arc(300 - Player.position.x, 225 + Player.position.y, 30, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = Colors.white;
        context.beginPath();
        context.arc(300 - Player.position.x, 225 + Player.position.y, 20, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = Colors.red;
        context.beginPath();
        context.arc(300 - Player.position.x, 225 + Player.position.y, 10, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = Colors.black;
        for (var i in Bullets) {
            context.beginPath();
            context.arc(300 - Bullets[i].x - Player.position.x, 225 + Bullets[i].y + Player.position.y, Bullets[i].size, 0, 2 * Math.PI);
            context.fill();
        }

        // CROSSHAIR
        /*
        context.strokeStyle = Colors.indigo;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(400, 0);
        context.lineTo(400, 450);
        context.stroke();

        context.beginPath();
        context.moveTo(0, 225);
        context.lineTo(800, 225);
        context.stroke();
        */

       context.strokeStyle = Colors.amber;
       context.lineWidth = 5;
       context.textAlign = "left";
       context.beginPath();
       context.arc(300, 225, Math.max(0.5 * Guns[GunsList[Player.gun]].spray, 10), 0, 2 * Math.PI);
       context.stroke();

        context.fillStyle = Colors.white;
        context.font = "14px 'Press Start 2P'";

        context.fillText("GUN", 20, 415);
        context.fillText(GunsList[Player.gun].toUpperCase(), 130, 415);

        context.fillText("BULLETS", 20, 435);
        for (var i = 0, s = ""; i < Player.magazine.bullets; i++)
            s = s + "|";
        for (; i < Guns[GunsList[Player.gun]].magazine; i++)
            s = s + ".";
        context.fillText(Player.magazine.bullets, 130, 435);
        context.fillText(s, 170, 435);

        context.fillStyle = Colors.white;
        context.font = "30px 'Press Start 2P'";
        context.fillText("SHO*TER", 20, 50);

        context.font = "14px 'Press Start 2P'";
        context.fillText("@L.DIAZZI", 20, 70);

        context.fillText("TIME", 400, 30);
        context.fillText("SCORE", 400, 50);

        context.textAlign = "right";

        context.fillText((Clock.elapsed / 1000).toFixed(1), 580, 30);
        context.fillText(Stats.score, 580, 50);

        context.textAlign = "left";

        context.fillStyle = Colors.amber;

        if (DEBUG) {
            context.fillText("MOUSE", 20, 100);
            context.fillText(Mouse.position.x, 120, 100);
            context.fillText(Mouse.position.y, 200, 100);

            context.fillText("PLAYER", 20, 120);
            context.fillText(Player.position.x, 120, 120);
            context.fillText(Player.position.y, 200, 120);

            context.fillText("FIRED", 20, 140);
            context.fillText(Bullets.length, 120, 140);

            context.fillText("RELOAD", 20, 160);
            context.fillText(Stats.reloads, 120, 160);

            context.fillText("ACCURACY", 20, 180);
            context.fillText((Stats.accuracy*100).toFixed() + "%", 150, 180);

        }

        context.textAlign = "center";
        context.font = "20px 'Press Start 2P'";
        if (Player.magazine.bullets == 0)
            context.fillText("RELOAD", 300, 310);
    }
};

window.onload = Shooter.init;