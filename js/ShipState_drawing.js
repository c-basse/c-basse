function draw_everything(shipstateArray,options,canvas,collect_data = false) {

	canvas.save();
	canvas.setTransform(1, 0, 0, 1, 0, 0);
  	canvas.clearRect(0, 0, layer0.width, layer0.height);
  	canvas.translate(layer0.width/2,layer0.height-200-350*(options.enable_hd || DATA_COLLECTION_MODE));
  	/*PRO MODE canvas.translate(layer0.width/2,layer0.height-550);*/

	for (var i = (shipstateArray.length-1); i >= 0; i--) {
		if (
				(
					(options.show_intermediate_location && i>0 && !shipstateArray[i].has_moved) ||
					(options.show_final_location && shipstateArray[i].has_moved) ||
					(i == 0) ||
					(options.show_all_locations)
				) && (
					(
						(options.show_stressed && shipstateArray[i].stress_count > 0) ||
						(options.show_unstressed && shipstateArray[i].stress_count == 0) ||
						(options.show_regardless_stress) ||
						!shipstateArray[i].has_moved ||
						i == 0
					)
				) 
			) {

			var range_bands = [];
			if(options.show_range1){
				range_bands.push(1);
			}
			if(options.show_range2){
				range_bands.push(2);
			}
			if(options.show_range3){
				range_bands.push(3);
			}



			var shipbase_alpha = (shipstateArray[i].has_moved || i==0) ? 0.7 : 0.1;

			shipstateArray[i].draw(shipbase_alpha,range_bands,options);
		}
	}

	/**************************
		Data Collection Mode
	**************************/

	if(DATA_COLLECTION_MODE && collect_data){
		canvas.restore();
		var myGetImageData = canvas.getImageData(0,0,1856, 1392);

		var data = myGetImageData.data;
	        // iterate over all pixels
	        var red_count = 0;
	        var black_count = 0;
	        var white_count = 0;
	        var grey_count = 0;
	        var blue_count = 0;
	        var green_count = 0;
	        for(var i = 0, n = data.length; i < n; i += 4) {
	          var is_black = data[i]==255 && data[i + 1]== 255 && data[i + 2] == 255;
	          var is_white = data[i]==0 && data[i + 1]== 0 && data[i + 2] == 0;
	          var is_bw = data[i]==data[i+1] && data[i] == data[i+2];
	          red_count += (data[i]>0 && !is_black && !is_bw) ? 1 : 0;
	          green_count += (data[i+1]>0 && !is_black && !is_bw) ? 1 : 0;
	          blue_count += (data[i+2]>0 && !is_black && !is_bw) ? 1 : 0;
	          black_count += (is_black) ? 1 : 0;
	          white_count += (is_white) ? 1 : 0;
	          grey_count += (!is_black && !is_white && is_bw) ? 1: 0;
	        }

	        return([red_count,green_count,blue_count]);

	}

}

function ShipState(basesize){

	this.basesize = basesize || SMALLBASE;
	//this.actions_remaining = actions_remaining || [];

	this.movearray = []; //moves to execute to get to final state, in order
	this.stress_count = 0;
	this.actions_used = [];
	this.frozen = false;
	this.has_moved = false;
	this.is_cloaked = false;
	this.actions_disabled = false;
	this.slide_array = []; //available slide maneuvers
	this.slam_speed = 99; //99 means no slam, unless FFG releases a ship with a 99 speed maneuver. In which case, rekt.
	this.force_count = 0;
	this.is_disarmed = false;

	this.execute_moves = function() {
		for (var i = 0;  i < this.movearray.length; i++) {
			this.execute_move(this.movearray[i],!DATA_COLLECTION_MODE); //don't draw paths if in data collection mode
		}
	}

	this.draw_arc = function(range,side_of_base,side_of_arc){

		var parallel_edge = (side_of_base%2 == 0) ? 'short' : 'long';

		c.save();
		c.translate(side_of_base%2*0.5*this.basesize,Math.abs(side_of_base)*0.5*this.basesize);
		c.rotate(90*side_of_base * Math.PI / 180);
		c.scale(side_of_arc,1);

		//0
		c.moveTo(0,-100*(range-1));
		c.beginPath();

		//1
		c.lineTo(0,-100*(range));

		//2
		c.lineTo(this.basesize/2,-100*range);

		//3
		c.arc(this.basesize/2,0,100*range,3*Math.PI/2,3*Math.PI/2+ARC_ANGLE[range][this.basesize][parallel_edge]);

		//4
		if(range-1 > 0 ) {
			c.arc(this.basesize/2,0,100*(range-1),3*Math.PI/2+ARC_ANGLE[range-1][this.basesize][parallel_edge],3*Math.PI/2,true);

		} else {
			c.lineTo(BASE_INTERSECT[this.basesize][parallel_edge].x,BASE_INTERSECT[this.basesize][parallel_edge].y);
			c.lineTo(BASE_INTERSECT[this.basesize][parallel_edge].x,0);
		}
		

		//5
		c.lineTo(0,-100*(range-1));

		//6
		c.closePath();

		c.globalAlpha = 0.1;
  	    c.fillStyle = "red";
  		c.fill();
		c.globalAlpha = 1.0;
		c.restore();

	}

	this.draw = function(shipbase_alpha, range_bands, options) {
		c.save();
		this.execute_moves();
		c.setLineDash([]);	
		// c.moveTo(0,0);
		// c.beginPath();
		// c.lineTo(this.basesize/2,0);
		// c.lineTo(this.basesize/2,this.basesize);
		// c.lineTo(-1*this.basesize/2,this.basesize);
		// c.lineTo(-1*this.basesize/2,0);
		// c.lineTo(this.basesize/2,0);

		if(!DATA_COLLECTION_MODE){ //don't draw ship bases in data collection mode
			if (this.stress_count >= 1) {
				c.strokeStyle = '#ff0000';
			} else {
				c.strokeStyle = '#000000';
			}


			//c.font = "20px Arial";
			//c.fillText("^", -5, 20);
			//c.arc(0,10,5,0,2*Math.PI);
			c.globalAlpha = shipbase_alpha+0.3;
			c.beginPath();
			c.rect(-1*this.basesize / 2, 0, this.basesize, this.basesize);
			c.stroke();
			c.globalAlpha = shipbase_alpha;
			c.fillStyle = "white";
			c.fill();
			c.globalAlpha = shipbase_alpha+0.3;
			c.beginPath();
			c.moveTo(-1*this.basesize / 5, this.basesize / 5);
			c.lineTo(0,this.basesize / 10);
			c.lineTo(this.basesize / 5,this.basesize / 5);
			
			c.stroke();	
		}
		
		if(this.has_moved && !this.is_cloaked && !this.is_disarmed){
			for (var i = 0; i<range_bands.length; i++){

				if(options.enable_forward_arc || options.show_single_forward || options.show_dual_parallel){
					this.draw_arc(range_bands[i],NORMAL,RIGHT);
					this.draw_arc(range_bands[i],NORMAL,LEFT);
				}

				if(options.enable_rear_arc || options.show_single_rear || options.show_dual_parallel){
					this.draw_arc(range_bands[i],REAR,RIGHT);
					this.draw_arc(range_bands[i],REAR,LEFT);
				}


				if(options.show_dual_perpendicular || options.show_single_left){
					this.draw_arc(range_bands[i],LEFT,RIGHT);
					this.draw_arc(range_bands[i],LEFT,LEFT);
				}


				if(options.show_dual_perpendicular || options.show_single_right){
					this.draw_arc(range_bands[i],RIGHT,RIGHT);
					this.draw_arc(range_bands[i],RIGHT,LEFT);
				}

				if(options.enable_forward_full_arc){
					this.draw_arc(range_bands[i],NORMAL,RIGHT);
					this.draw_arc(range_bands[i],NORMAL,LEFT);
					this.draw_arc(range_bands[i],LEFT,RIGHT);
					this.draw_arc(range_bands[i],RIGHT,LEFT);

				}


			}

			if (options.show_bullseye){
				c.beginPath();
				c.rect(-1*7.5, -300, 15, 300);
		    	c.closePath();
				c.globalAlpha = 0.1;
		    	c.fillStyle = "blue";
		    	c.closePath();
		    	c.fill();
				c.globalAlpha = 1.0;
			}
		}
		c.restore();
	}

	this.add_move = function(maneuver) {
		this.movearray.push(maneuver);
	}

	this.execute_move = function(maneuver,draw_path=false){
		var bearing = maneuver.bearing;
		var speed = maneuver.speed;
		var direction = maneuver.direction;
		var roll_direction = maneuver.roll_direction || NORMAL; //NORMAL means not a roll
		var slide_direction = maneuver.slide_direction || MID;
		var radius;
		var draw_type = maneuver.draw_type;
		switch(draw_type){
			case 0:
				c.setLineDash([]);
			break;
			case 1:
				c.setLineDash([2,2]);
			break;
		}
		if (roll_direction != 0) {
			this.execute_move({bearing:"rotate",speed:90,direction:roll_direction,draw_type:draw_type},draw_path);
			if(this.basesize > SMALLBASE){
				this.execute_move({bearing:bearing,speed:speed/2,direction:direction,draw_type:draw_type},draw_path);
			} else {
				this.execute_move({bearing:bearing,speed:speed,direction:direction,draw_type:draw_type},draw_path);
			}
			this.execute_move({bearing:"rotate",speed:90,direction:-1*roll_direction,draw_type:draw_type},draw_path);
			
			if(this.basesize > SMALLBASE){
				c.translate(0,-1*SLIDE_DISTANCE*2*slide_direction);
			} else {
				c.translate(0,-1*SLIDE_DISTANCE*slide_direction);
			}
		} else if (speed < 0) {
			this.execute_move({bearing:"rotate",speed:180,direction:RIGHT,draw_type:draw_type},draw_path);
			this.execute_move({bearing:bearing,speed:speed*-1,direction:direction*-1,draw_type:draw_type},draw_path);
			this.execute_move({bearing:"rotate",speed:180,direction:RIGHT,draw_type:draw_type},draw_path),draw_path;
		} else {
			switch(bearing) {
				case "straight":
					switch(speed) {
							case 0:
						this.execute_move({bearing:"straight",speed:-1,draw_type:draw_type},false);
						this.execute_move({bearing:"straight",speed:+1,draw_type:draw_type},false);
							break;
						default:
							if(draw_path){
								c.beginPath(); //path
								c.moveTo(0,0); //path
								c.lineTo(0,-40*speed); //path
								c.stroke(); //path
							}
							c.translate(0,-40*speed);
							c.translate(0,-1*this.basesize);
						}
					break;
				case "turn":
					switch(speed) {
						case 1:
							radius = 35.5;
							break;
						case 2:
							radius = 63;
							break;
						case 3:
							radius = 89.5;
							break;
						}
					if(draw_path){
						c.beginPath(); //path
						ccw = (direction == RIGHT) ? false : true;
						c.arc(0+radius*direction,0,radius,(direction+1)/2*Math.PI,1.5*Math.PI,ccw);
						c.stroke(); //path
					}
					c.translate(direction*radius,-radius);
					c.rotate(direction * 90 * Math.PI / 180);
					c.translate(0,-1*this.basesize);
					break;
				case "bank":
					switch(speed) {
						case 1:
							radius = 82.5;
							break;
						case 2:
							radius = 132.5;
							break;
						case 3:
							radius = 182;
							break;
						}
					if(draw_path){
						c.beginPath(); //path
						ccw = (direction == RIGHT) ? false : true;
						c.arc(0+radius*direction,0,radius,(direction+1)/2*Math.PI,Math.PI*(1.5-direction*0.25),ccw);
						c.stroke(); //path
					}
					c.translate(direction*radius*(1-Math.cos(Math.PI*45/180)),-radius*Math.sin(Math.PI*45/180));
					c.rotate(direction * 45 * Math.PI / 180);
					c.translate(0,-1*this.basesize);
					break;
				case "sloop":
					this.execute_move({bearing:"bank",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:RIGHT,draw_type:draw_type},draw_path);
					break;
				case "ig88d":
					this.execute_move({bearing:"turn",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:RIGHT,draw_type:draw_type},draw_path);
					break;
				case "talon":
					this.execute_move({bearing:"turn",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:90,direction:direction,draw_type:draw_type},draw_path);
					c.translate(0,-1*SLIDE_DISTANCE*slide_direction);
					break;
				case "kturn":
					this.execute_move({bearing:"straight",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:RIGHT,draw_type:draw_type},draw_path);
					break;
				case "stop":
					this.execute_move({bearing:"straight",speed:-1,draw_type:draw_type},draw_path);
					break;
				case "rotate":
					c.translate(0,this.basesize/2);
					c.rotate(direction * speed * Math.PI / 180);
					c.translate(0,-1*this.basesize/2);
					break;
			}
		}

	}

	this.clone = function() {
		var cloned_shipstate = new ShipState(this.basesize);
		cloned_shipstate.movearray = this.movearray.slice(0);
		cloned_shipstate.stress_count = this.stress_count;
		cloned_shipstate.actions_used = this.actions_used.slice(0);
		cloned_shipstate.has_moved = this.has_moved;
		cloned_shipstate.is_cloaked = this.is_cloaked;
		cloned_shipstate.actions_disabled = this.actions_disabled;
		cloned_shipstate.slide_array = this.slide_array.slice(0);
		cloned_shipstate.slam_speed = this.slam_speed;
		cloned_shipstate.force_count = this.force_count;
		cloned_shipstate.is_disarmed = this.is_disarmed;
		return cloned_shipstate;
	}
}