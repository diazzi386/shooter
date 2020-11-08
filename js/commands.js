var commands = {
	state: {
		throttle: false,
		brake: false,
	}, init: function () {
		// TOUCH
		/*
		document.body.addEventListener('contextmenu', function(event) {
			event.preventDefault();
		}, false)
		*/

		document.body.addEventListener('pointerdown', mouse.start);
		document.body.addEventListener('pointerup', mouse.end);
		document.body.addEventListener('pointermove', mouse.move);

		// KEYBOARD            
		document.body.addEventListener('keyup', function (event) {
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			var k = event.keyCode ? event.keyCode : event.which;
			keyboard.up.choose(k);
		}, false);
		document.body.addEventListener('keydown', function (event) {
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			if (event.repeat == true) return; //
			var k = event.keyCode ? event.keyCode : event.which;
			keyboard.down.choose(k);
		}, false);
	}, getXY: function (event) {
		var h = document.body.offsetHeight;
		var b = document.body.offsetWidth;
		var x = event.pageX;
		var y = event.pageY;
		var fx, fy;
		
		fx = x / b;
		fy = 1 - y / h;

		fx = commands.norm(fx);
		fy = commands.norm(fy);

		return {
			x: fx,
			y: fy
		};
	}, norm: function (q) {
		if (q < 0)
			return 0;
		else if (q > 1)
			return 1;
		else return q;
	}
}

var mouse = {
	last: 0,
	start: function (event) {
		if (event.target.matches("*[href], *[onclick]"))
			return;
		// if (!event.target.matches(".tab") && ui.tab)
		//	return ui.display();
		if (ui.tab)
			return;
		var data = commands.getXY(event);
		if (data.x < 0.5) {
			pedals.push(1, data.y);
			commands.state.brake = true;
		} else if (data.x >= 0.5) {
			pedals.push(2, data.y);
			commands.state.throttle = true;
		}
	}, end: function (event) {
		if (event.target.matches("*[href], *[onclick]"))
			return;
		if (!event.target.matches(".tab") && ui.tab)
			return ui.display();
		if (ui.tab)
			return;
		var data = commands.getXY(event);
		if (data.x < 0.5) {
			pedals.release(1);
			commands.state.brake = false;
		} else if (data.x >= 0.5) {
			pedals.release(2);
			commands.state.throttle = false;
		}
	}, move: function (event) {
		if (event.target.matches("*[href], *[onclick]"))
			return;
		// if (!event.target.matches(".tab") && ui.tab)
		//	return ui.display();
		if (ui.tab)
			return;
		var data = commands.getXY(event);
		if (data.x < 0.5 && commands.state.brake)
			pedals.push(1, data.y);
		if (data.x >= 0.5 && commands.state.throttle)
			pedals.push(2, data.y);
	}
}

var keyboard = {
	pressing: false,
    up: {
        choose: function (key) {
			switch (key) {
                // PEDALS
                case 65: // A:
                    pedals.release(1);
                    break;
				case 83: // S:
					pedals.release(2);
					break;
				// GEARS
				case 13:
					transmission.upshift();
					break;
				case 8:
					transmission.downshift();
					break;
				default:
					break;
            }
        }
    }, down: {
        choose: function (key) {
			switch (key) {
				// Pedals
				case 65: // A
					pedals.push(1);
					break;
				case 70: // F
				case 83: // S
					pedals.push(2);
					break;
				// Transmission
				case 77: // M
					transmission.toggle();
					break;
				// Display
				case 67: // C:
					ui.display('C');
					break;
				case 68: // D:
					ui.display('D');
					break;
				case 72: // H:
					ui.display('H');
					break;
				case 89: // Y
					ui.display('Y');
					break;
				// Controls
				case 76: // L
					if (transmission.gear == 0)
						transmission.launch = !transmission.launch;
					break;
				case 219:
				case 222: // ?:
					ui.random();
					break;
				case 48: // =
					location.reload();
					break;
				default:
					break;
            }
        }
    }
};