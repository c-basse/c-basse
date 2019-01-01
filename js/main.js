var layer0= document.getElementById("layer0");
var c = layer0.getContext("2d");

//one time run to generate pilot list from yasb data
//kind of slow, how to speed up someday?
var pilots_by_ship = PILOTS_SEED;
for(j = 0; j<basicCardData().pilotsById.length; j++){
	var yasb_pilot = basicCardData().pilotsById[j];
	for(ship_name in pilots_by_ship){
		pilot_found = false;
		for(i = 0; i < pilots_by_ship[ship_name].length; i++){
			var my_pilot = pilots_by_ship[ship_name][i];
			
				if(my_pilot.pilot_name == yasb_pilot.name){
					my_pilot.slots = my_pilot.slots.concat(yasb_pilot.slots);
					if(i > 0){ //i==0 is the generic, so this only happens if this is not a generic
						my_pilot.faction = yasb_pilot.faction;
					}
					my_pilot.starting_force = yasb_pilot.force || 0;
					pilot_found = true;
					break;
				}
		}
		if(pilot_found){break;}
	}
}

function translate_id_to_yasb_name(html_id){
		var yasb_name = html_id.replace(/__O__/g, "("); //open_parentheses
		yasb_name = yasb_name.replace(/__C__/g, ")"); //cloes_parentheses
		yasb_name = yasb_name.replace(/__Q__/g, '"'); //quotes
		yasb_name = yasb_name.replace(/__D__/g, '/'); //dash
		yasb_name = yasb_name.replace(/_/g, " ");
		return yasb_name;
}

function get_button_states(label_class){
	var state_object = {};
    $(label_class).each(function() {
	    var button_element = $(this).children()[0]
	    state_object[button_element.id] = ($(button_element).is(":checked") || $($(button_element).parent()).hasClass("invisible")) ? true : false;
	});
  	return state_object;
}

function change_button_state(html_id,new_state){
	if (new_state) {
  		$("#"+html_id).prop("checked",true);
  		$($("#"+html_id).parent()).addClass("active");
  	} else {
  		$("#"+html_id).prop("checked",false);
  		$($("#"+html_id).parent()).removeClass("active");
  	}
}

function get_selected_radio_option(html_class){
	return $(html_class).children('input:radio:checked')[0].id;
}

function ShipState(basesize){

	this.basesize = basesize || smallbase;
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
			this.execute_move(this.movearray[i],true)
		}
	}

	this.draw = function(shipbase_alpha, range_bands, show_bullseye) {
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

		var small_edge = ((this.basesize-60)/1000+0.88)*this.basesize;
		
		if(this.has_moved && !this.is_cloaked && !this.is_disarmed){
			for (var i = 0; i<range_bands.length; i++){

				c.beginPath();
				var small_edge = ((this.basesize-60)/1000+0.88)*this.basesize;
				c.moveTo(-1*this.basesize/2-100*(range_bands[i]-1)*Math.sin(0.5*Math.PI-Math.atan(this.basesize/small_edge)),-100*(range_bands[i]-1)*Math.cos(0.5*Math.PI-Math.atan(this.basesize/small_edge)));
				c.lineTo(-1*this.basesize/2-100*(range_bands[i])*Math.sin(0.5*Math.PI-Math.atan(this.basesize/small_edge)),-100*(range_bands[i])*Math.cos(0.5*Math.PI-Math.atan(this.basesize/small_edge)));
				c.arc(-1*this.basesize/2,0,100*(range_bands[i]),Math.PI+Math.atan(this.basesize/small_edge),1.5*Math.PI);
				c.lineTo(this.basesize/2,-100*(range_bands[i]));
				c.arc(this.basesize/2,0,100*(range_bands[i]),1.5*Math.PI,2*Math.PI-Math.atan(this.basesize/small_edge));
				c.lineTo(this.basesize/2+100*(range_bands[i])*Math.sin(0.5*Math.PI-Math.atan(this.basesize/small_edge)),-100*(range_bands[i])*Math.cos(0.5*Math.PI-Math.atan(this.basesize/small_edge)));
				c.lineTo(this.basesize/2+100*(range_bands[i]-1)*Math.sin(0.5*Math.PI-Math.atan(this.basesize/small_edge)),-100*(range_bands[i]-1)*Math.cos(0.5*Math.PI-Math.atan(this.basesize/small_edge)));
				c.arc(this.basesize/2,0,100*(range_bands[i]-1),2*Math.PI-Math.atan(this.basesize/small_edge),1.5*Math.PI,true);
				c.lineTo(-1*this.basesize/2,-100*(range_bands[i]-1));
				c.arc(-1*this.basesize/2,0,100*(range_bands[i]-1),1.5*Math.PI,Math.PI+Math.atan(this.basesize/small_edge),true);
				c.closePath();

				c.globalAlpha = 0.1;
		    	//c.fillStyle = "#"+("000000"+(0xFF * Math.pow(0x100,range_bands[i]-1)).toString(16)).substr(-6);
		    	c.fillStyle = "red";
		    	//c.lineWidth = 4;

		    	c.fill();
				//c.stroke();
 
				c.globalAlpha = 1.0;
			}
			if (show_bullseye) {
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
		var roll_direction = maneuver.roll_direction || normal; //normal means not a roll
		var slide_direction = maneuver.slide_direction || mid;
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
			if(this.basesize > smallbase){
				this.execute_move({bearing:bearing,speed:speed/2,direction:direction,draw_type:draw_type},draw_path);
			} else {
				this.execute_move({bearing:bearing,speed:speed,direction:direction,draw_type:draw_type},draw_path);
			}
			this.execute_move({bearing:"rotate",speed:90,direction:-1*roll_direction,draw_type:draw_type},draw_path);
			
			if(this.basesize > smallbase){
				c.translate(0,-1*slide_distance*2*slide_direction);
			} else {
				c.translate(0,-1*slide_distance*slide_direction);
			}
		} else if (speed < 0) {
			this.execute_move({bearing:"rotate",speed:180,direction:right,draw_type:draw_type},draw_path);
			this.execute_move({bearing:bearing,speed:speed*-1,direction:direction*-1,draw_type:draw_type},draw_path);
			this.execute_move({bearing:"rotate",speed:180,direction:right,draw_type:draw_type},draw_path),draw_path;
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
						ccw = (direction == right) ? false : true;
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
						ccw = (direction == right) ? false : true;
						c.arc(0+radius*direction,0,radius,(direction+1)/2*Math.PI,Math.PI*(1.5-direction*0.25),ccw);
						c.stroke(); //path
					}
					c.translate(direction*radius*(1-Math.cos(Math.PI*45/180)),-radius*Math.sin(Math.PI*45/180));
					c.rotate(direction * 45 * Math.PI / 180);
					c.translate(0,-1*this.basesize);
					break;
				case "sloop":
					this.execute_move({bearing:"bank",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:right,draw_type:draw_type},draw_path);
					break;
				case "ig88d":
					this.execute_move({bearing:"turn",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:right,draw_type:draw_type},draw_path);
					break;
				case "talon":
					this.execute_move({bearing:"turn",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:90,direction:direction,draw_type:draw_type},draw_path);
					c.translate(0,-1*slide_distance*slide_direction);
					break;
				case "kturn":
					this.execute_move({bearing:"straight",speed:speed,direction:direction,draw_type:draw_type},draw_path);
					this.execute_move({bearing:"rotate",speed:180,direction:right,draw_type:draw_type},draw_path);
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

function ShipConfig(){

	this.ship_name = "default";
	this.ship_id = "default";
	this.faction_name = "";
	this.basesize = smallbase;
	this.action_bar = [];
	this.move_sets = {
		roll_set: {},
		boost_set: {},
		decloak_set: {},
		aileron_set: {},
		maneuver_set: {}
	};

	this.pilot = {};
	this.ship_ability = {};

	this.upgrades = {};

	this.change_ship = function(yasb_ship) {
		
		var default_enable = true;
		var translate_bearing = ["turn","bank","straight","bank","turn","kturn","sloop","sloop","talon","talon","bank","straight","bank"];
		var translate_direction = [left,left,normal,right,right,normal,left,right,left,right,left,normal,right];
		var translate_direction_name = ["left","left","","right","right","","left","right","left","right","left","","right"];
		var translate_color = [none,white,blue,red];
		var translate_speed_polarity = [1,1,1,1,1,1,1,1,1,1,-1,-1,-1];

		this.ship_name = yasb_ship.name;

		for (var key in this.ship_ability ){
			this.ship_ability[key]  = false;
		}

		switch(this.ship_name) {
			case "StarViper":
				this.ship_ability.microthrusters = true;
			break;
			case "TIE/VN Silencer":
				this.ship_ability.autothrusters = true;
			break;
			case "TIE Interceptor":
				this.ship_ability.autothrusters = true;
			break;
			case "TIE Striker":
				this.ship_ability.adaptive_ailerons = true;
			break;
			case "TIE Reaper":
				this.ship_ability.adaptive_ailerons = true;
			break;
			case "RZ-2 A-Wing":
				this.ship_ability.refined_gyrostabilizers = true;
			break;
			case "A-Wing":
				this.ship_ability.vectored_thrusters = true;
			break;
		}	


		this.basesize = smallbase;
		this.basesize = (yasb_ship.large) ? largebase : this.basesize;
		this.basesize = (yasb_ship.medium) ? mediumbase : this.basesize;
		if(this.ship_ability.microthrusters){
			this.move_sets.roll_set = $.extend(true, {}, microthrusters_roll_set);
		} else {
			this.move_sets.roll_set = $.extend(true, {}, standard_roll_set);
		}
		this.move_sets.boost_set = $.extend(true, {}, standard_boost_set);
		this.move_sets.decloak_set = $.extend(true, {}, standard_decloak_set);
		this.move_sets.aileron_set = $.extend(true, {}, standard_boost_set);
		this.move_sets.maneuver_set = {};

		this.action_bar = yasb_ship.actions.slice(0);
		for(var i=0; i< yasb_ship.actionsred.length; i++){
			if(yasb_ship.actionsred[i]=="Barrel Roll"){
				this.action_bar.push(yasb_ship.actionsred[i]);
				for(var move_name in this.move_sets.roll_set){
					this.move_sets.roll_set[move_name].color = red;
				}
			} else if (yasb_ship.actionsred[i]=="Boost"){
				this.action_bar.push(yasb_ship.actionsred[i]);
				for(var move_name in this.move_sets.boost_set){
					this.move_sets.boost_set[move_name].color = red;
				}
			}
		}

		for (var speed = 0; speed < yasb_ship.maneuvers.length; speed++) {
			for (var i = 0; i < yasb_ship.maneuvers[speed].length; i++){
				if(translate_color[yasb_ship.maneuvers[speed][i]] != none){
					var new_maneuver;
					if(translate_bearing[i] == "talon"){
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: normal,slide: true,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable, draw_type: 0};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					} else {
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: normal,slide: false,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable, draw_type: 0};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					}
					
				}
			}
		}
	}


	this.update_maneuver_set = function() {
    
	    var parent_elements = $(".maneuver-option");

	  	for (var move_name in this.move_sets.maneuver_set) {
	  		this.move_sets.maneuver_set[move_name].enabled = ($(parent_elements.children("#"+move_name)[0]).is(":checked")) ? true : false;
	  	}
	}
}

function draw_everything(shipstateArray,options,canvas) {

	canvas.setTransform(1, 0, 0, 1, 0, 0);
  	canvas.clearRect(0, 0, layer0.width, layer0.height);
  	canvas.translate(layer0.width/2,layer0.height-200);

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

				shipstateArray[i].draw(shipbase_alpha,range_bands,options.show_bullseye);
			}
		}	
}


//process faction change
//asigns faction name to ship_config
//makes only valid ships for this faction visible
//selects the first ship as the active ship
//calls process_ship_change with the first ship
function process_faction_change(faction_id,ship_config){
	var ship_buttons = get_button_states(".ship-option");
	var yasb_faction_name = translate_id_to_yasb_name(faction_id);

	ship_config.faction_name = yasb_faction_name;
	var default_ship_id;
	var first_only = true;
	for (ship_id in ship_buttons){
		yasb_ship_name = translate_id_to_yasb_name(ship_id);

		if($.inArray(yasb_faction_name,basicCardData().ships[yasb_ship_name].factions) != -1){
			$($("#" + ship_id).parent()).removeClass("d-none"); 
			if(first_only){
				default_ship_id = ship_id;
				change_button_state(ship_id,true);
				first_only = false;
			} else {
				change_button_state(ship_id,false);
			}
		 //here here here
		} else {
			$($("#" + ship_id).parent()).addClass("d-none"); 
			change_button_state(ship_id,false);
		}
	}
	process_ship_change(default_ship_id,ship_config);
}

function is_upgrade_valid(slot_name,upgrade_id,ship_config) {
	var check = 
	$.inArray(slot_name,ship_config.pilot.slots) !=-1 &&
	(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase) &&
	(!($($("#" + upgrade_id).parent()).hasClass("mediumbaseonly")) || ship_config.basesize == mediumbase) &&
	(!($($("#" + upgrade_id).parent()).hasClass("largebaseonly")) || ship_config.basesize == largebase) &&
	(!($($("#" + upgrade_id).parent()).hasClass("requiresboost")) || $.inArray("Boost",ship_config.action_bar)>-1) &&
	(!($($("#" + upgrade_id).parent()).hasClass("requiresroll")) || $.inArray("Barrel Roll",ship_config.action_bar)>-1) &&
	(!($($("#" + upgrade_id).parent()).hasClass("requiresredboost")) || $.inArray("Boost",basicCardData().ships[ship_config.ship_name].actionsred)>-1) &&
	(!($($("#" + upgrade_id).parent()).hasClass("requiresredroll")) || $.inArray("Barrel Roll",basicCardData().ships[ship_config.ship_name].actionsred)>-1) &&
	(!($($("#" + upgrade_id).parent()).hasClass("rebelonly")) || ship_config.faction_name == "Rebel Alliance") &&
	(!($($("#" + upgrade_id).parent()).hasClass("empireonly")) || ship_config.faction_name == "Galactic Empire") &&
	(!($($("#" + upgrade_id).parent()).hasClass("scumonly")) || ship_config.faction_name == "Scum and Villainy") &&
	(!($($("#" + upgrade_id).parent()).hasClass("resistanceonly")) || ship_config.faction_name == "Resistance") &&
	(!($($("#" + upgrade_id).parent()).hasClass("firstorderonly")) || ship_config.faction_name == "First Order") &&
	((slot_name != "Title" && slot_name != "Configuration")|| $($("#" + upgrade_id).parent()).hasClass(ship_config.ship_id) );
	return check;
			
}

//process_ship_change
//step1, update ship config with the new ship
//step2, select default pilot and set only valid (right ship, right faction) pilot options to show
//step3, setup the maneuver selection area based on available maneuvers and their color
//step4a, make all upgrades invisible except and set all upgrades to default as "None"
//step4b, only show upgrade types that exist on the given ship
//step5, update pilot select icon with icon matching faction
//step7, calls process_pilot_change with default "none" pilot --> calls process_maneuver_button_change --> calls update_maneuver_set --> updates ship select with current ship icon
function process_ship_change(ship_id,ship_config){
	var yasb_ship_name = translate_id_to_yasb_name(ship_id);

	//step1
	ship_config.change_ship(basicCardData().ships[yasb_ship_name]);
	ship_config.ship_id = ship_id;

	//step2
	var default_pilot_id;
	var at_least_one_pilot_found = false;
	var pilot_buttons = get_button_states(".pilot-option");
	for (pilot_id in pilot_buttons){
		yasb_pilot_name = translate_id_to_yasb_name(pilot_id);
		
		if(pilot_id == "no_pilot"){
			$($("#" + pilot_id).parent()).removeClass("d-none"); 
			default_pilot_id = pilot_id;
			change_button_state(pilot_id,true);
			ship_config.pilot = pilots_by_ship[ship_config.ship_name][0]
			continue;
		}

		change_button_state(pilot_id,false); 
		var pilot_found = false;
		for(i=1;i<pilots_by_ship[yasb_ship_name].length;i++){
			if(pilots_by_ship[yasb_ship_name][i].pilot_name==yasb_pilot_name && pilots_by_ship[yasb_ship_name][i].faction==ship_config.faction_name){
			 	$($("#" + pilot_id).parent()).removeClass("d-none");	
			 	pilot_found = true;
			 	at_least_one_pilot_found = true;
			 	break;
			}
		}
		if(!pilot_found){
			$($("#" + pilot_id).parent()).addClass("d-none");
		}
	}

	if(at_least_one_pilot_found){
		$("#Pilot-group").removeClass("d-none");
	} else {
		$("#Pilot-group").addClass("d-none");
	}

    $(".pilot-group").each(function() {
    	var [slot_name,dummy] = this.id.split("-");
    	if($.inArray(slot_name,slot_with_available_options)!=-1){
    		$(this).removeClass("d-none");
    	} else if (slot_name == "Talent" && $.inArray("Force",slot_with_available_options)!=-1) {
    		$(this).removeClass("d-none");
    	} else {
    		$(this).addClass("d-none");
    	}
    });

	//step3
	var maneuver_buttons = get_button_states(".maneuver-option");

	var has_speed = {};
	var has_bearing_direction = {};

	//make all buttons un-hidden and create list of possible speeds and bearing_directions;
	for (var maneuver_button in maneuver_buttons) {
		var [speed,bearing_direction] = maneuver_button.split("-");
		if (speed != "all" && bearing_direction != "all"){
			$($("#" + maneuver_button).parent()).addClass("invisible"); //make all invisible, only present maneuvers will be invisible later on
		}
		$($("#" + maneuver_button).parent()).removeClass("d-none"); //make all non-hidden, i.e. make them take up space; will re-evaluate at the end
		if (speed != "all"){
			has_speed[speed] = false;
			$("#" + speed + "-" + "all-row").removeClass("d-none");
		}
		if (bearing_direction != "all") {
			has_bearing_direction[bearing_direction] = false;
		}
	}


	for (var move_name in ship_config.move_sets.maneuver_set) {
		
		var [speed,bearing_direction] = move_name.split("-");
		
		$("#" + speed + "-" + bearing_direction).parent().removeClass("invisible"); //make button visible because it's maneuver exists in the ship
		
		switch(ship_config.move_sets.maneuver_set[move_name].color){
			case red:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case blue:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case white:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("white-maneuver")
				break;
		}

		has_speed[speed] = true;
		has_bearing_direction[bearing_direction] = true;
	}

	for (var maneuver_button in maneuver_buttons) {
		var [speed,bearing_direction] = maneuver_button.split("-");
		if(!has_speed[speed] && speed != "all"){
			$($("#" + maneuver_button).parent()).addClass("d-none"); 
			$("#" + speed + "-" + "all").parent().addClass("d-none");
			$("#" + speed + "-" + "all-row").addClass("d-none");
		}
		if(!has_bearing_direction[bearing_direction] && bearing_direction != "all"){
			$($("#" + maneuver_button).parent()).addClass("d-none"); 
			$("#" + "all" + "-" + bearing_direction).parent().addClass("d-none"); 
		}
	}
    
    //step4a
	var upgrade_buttons = get_button_states(".upgrade-option");

	for (upgrade_id in upgrade_buttons){
		if(upgrade_id.substring(0,3) == "no_"){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
			change_button_state(upgrade_id,true);
			continue;
		} else {
			change_button_state(upgrade_id,false);
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}
	}

	//step4b
	var slot_with_available_options = []
	for (slot in pilots_by_ship[ship_config.ship_name][0].slots){
		upgrade_buttons = get_button_states("." + pilots_by_ship[ship_config.ship_name][0].slots[slot] + "-option");
		for (upgrade_id in upgrade_buttons) {
			if (
			  upgrade_id.substring(0,3) != "no_" &&
			  is_upgrade_valid(pilots_by_ship[ship_config.ship_name][0].slots[slot],upgrade_id,ship_config) 
  			) {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
				slot_with_available_options.push(pilots_by_ship[ship_config.ship_name][0].slots[slot]);
			}
		}
	}

    $(".upgrade-group").each(function() {
    	var [slot_name,dummy] = this.id.split("-");
    	if($.inArray(slot_name,slot_with_available_options)!=-1){
    		$(this).removeClass("d-none");
    	} else if (slot_name == "Talent" && $.inArray("Force",slot_with_available_options)!=-1) {
    		$(this).removeClass("d-none");
    	} else {
    		$(this).addClass("d-none");
    	}
    });

    //step5
    $($("#Pilot-group-label").children()[0]).removeClass("xwing-miniatures-font-helmet-scum");
    $($("#Pilot-group-label").children()[0]).removeClass("xwing-miniatures-font-helmet-rebel");
    $($("#Pilot-group-label").children()[0]).removeClass("xwing-miniatures-font-helmet-imperial");

    if (ship_config.faction_name == "First Order" || ship_config.faction_name == "Galactic Empire") {
   		$($("#Pilot-group-label").children()[0]).addClass("xwing-miniatures-font-helmet-imperial");
    } else if (ship_config.faction_name == "Scum and Villainy") {
   		$($("#Pilot-group-label").children()[0]).addClass("xwing-miniatures-font-helmet-scum");

    } else {
   		$($("#Pilot-group-label").children()[0]).addClass("xwing-miniatures-font-helmet-rebel");
    }

	process_pilot_change(default_pilot_id,ship_config);
	process_maneuver_button_change($(document),ship_config);
	ship_config.update_maneuver_set();
	$("#ship_drawer_button").removeClass();
	$("#ship_drawer_button").addClass($($("#"+ship_id).parent()).children()[1].className);
}

//updates ship_config with pilot
//reset maneuver sets
//import special maneuver sets for specific pilots
//setup force/talent slot if needed (if prior upgrade is no longer posisble with new pilot)
//calls process_upgrade_buttons
function process_pilot_change(pilot_id,ship_config){
	var yasb_pilot_name = translate_id_to_yasb_name(pilot_id);


	if(pilot_id == "no_pilot"){
		ship_config.pilot = pilots_by_ship[ship_config.ship_name][0];
	} else {
		for(var i = 1; i<pilots_by_ship[ship_config.ship_name].length; i++){
			if(pilots_by_ship[ship_config.ship_name][i].pilot_name == yasb_pilot_name){
				ship_config.pilot = pilots_by_ship[ship_config.ship_name][i];
				break;
			}
		}
	}

	//reset decloak from whatever special abilities may have been enabled (only works for decloak since it can't be red)
	ship_config.move_sets.decloak_set = standard_decloak_set;

	//maneuvers can be selectively enabled during "generate shipstates" so no special action to reset (just make sure the get disabled by running update_maneuver_set)

	//boost and roll resets are problematic since we can't just reset to default without knowing color; probably should come up with more elegant solution. Because this is just kare kun so far, we'll do the lazy way for now.
	if ("kare_kun_boost_left" in ship_config.move_sets.boost_set) {
		delete ship_config.move_sets.boost_set["kare_kun_boost_left"];
		delete ship_config.move_sets.boost_set["kare_kun_boost_right"];
	}

	switch(ship_config.pilot.pilot_name){
		case "IG-88D":
			ship_config.move_sets.maneuver_set = $.extend(true,ship_config.move_sets.maneuver_set,ig88d_sloop_set);
		break;
		case "Countess Ryad":
			ship_config.move_sets.maneuver_set = $.extend(true,ship_config.move_sets.maneuver_set,ryad_kturn_set);
		break;
		case '"Echo"':
			ship_config.move_sets.decloak_set = $.extend(true,{},echo_decloak_set);
		break;
		case "Poe Dameron":
			ship_config.pilot.starting_force = 1; //using "force" as a stand-in for charge. I don't see any overlap scenario that would cause problems since poe is not a force user. 
		break;
		case "Kare Kun":
			ship_config.move_sets.boost_set = $.extend(true,ship_config.move_sets.boost_set,kare_kun_boost_set);
		break;
	}
	ship_config.update_maneuver_set(); //need to de-enable extra moves like from ryad or ig-88d


	//check if talent or force needs to be reset
	var has_force_or_talent = false;
	var upgrade_buttons = get_button_states(".Talent-option");
	for (upgrade_id in upgrade_buttons) {
		if (
			  upgrade_id.substring(0,3) != "no_" &&
			  is_upgrade_valid("Talent",upgrade_id,ship_config) 
			) {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
				has_force_or_talent = true;
			} else if (upgrade_id.substring(0,3) != "no_") {
				$($("#" + upgrade_id).parent()).addClass("d-none"); 
				if(upgrade_buttons[upgrade_id]) {
					change_button_state(upgrade_id,false); 
					change_button_state("no_talent",true);
				}
			} else {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
			}
	}

	upgrade_buttons = get_button_states(".Force-option");
	for (upgrade_id in upgrade_buttons) {
		if (
			  upgrade_id.substring(0,3) != "no_" &&
			  is_upgrade_valid("Force",upgrade_id,ship_config) 
			) {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
				has_force_or_talent = true;
			} else if (upgrade_id.substring(0,3) != "no_") {
				$($("#" + upgrade_id).parent()).addClass("d-none"); 
				if(upgrade_buttons[upgrade_id]) {
					change_button_state(upgrade_id,false); 
					change_button_state("no_talent",true);
				}
			} else {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
			}
	}

	if(has_force_or_talent){
		$("#Talent-group").removeClass("d-none");
	} else {
		$("#Talent-group").addClass("d-none");
	}


	process_upgrade_buttons(ship_config); 
}

function process_upgrade_buttons(ship_config){

		ship_config.upgrades = get_button_states(".upgrade-option");

		if(ship_config.upgrades.daredevil){
			ship_config.move_sets.boost_set["daredevil-left"] = {bearing:"turn",speed: 1,direction: left,roll_direction: normal,slide: false,color: red,enabled: true};
			ship_config.move_sets.boost_set["daredevil-right"] = {bearing:"turn",speed: 1,direction: right,roll_direction: normal,slide: false,color: red,enabled: true};
		} else {
			delete ship_config.move_sets.boost_set["daredevil-right"];
			delete ship_config.move_sets.boost_set["daredevil-left"];
		}


		if(ship_config.upgrades.pivot_wing){
			ship_config.move_sets.maneuver_set = $.extend(true,ship_config.move_sets.maneuver_set,pivot_wing_set);
		}

		if(ship_config.ship_name == "X-Wing") {
			if(ship_config.upgrades.t65_foils){
				ship_config.action_bar = ["Focus", "Lock", "Boost","Barrel Roll"];
			} else {
				ship_config.action_bar = ["Focus", "Lock", "Barrel Roll"];
			}
		}

		if (ship_config.ship_name == "T-70 X-Wing"){
			if(ship_config.upgrades.t70_foils){
				ship_config.action_bar = ["Focus", "Lock", "Boost","Barrel Roll"];
			} else {
				ship_config.action_bar = ["Focus", "Lock", "Boost"];
			}
			if(ship_config.upgrades.black_one){
				ship_config.action_bar.push("Slam")
			}
		}

		if (ship_config.ship_name == "G-1A Starfighter"){
			if(ship_config.upgrades.mist_hunter){
				ship_config.action_bar = ["Focus", "Lock", "Jam","Barrel Roll"];
			} else {
				ship_config.action_bar = ["Focus", "Lock", "Jam"];
			}
		}

		ship_config.update_maneuver_set(); //this is needed to disable for things that have changed the maneuver set (e.g. pivot wing)
		revalidate_maneuver_button_colors(ship_config); // this updates how maneuver colors are displayed based on some upgrades even though we don't update that actual color in case the upgrade is removed later. color change effect is actually handled in genereate_shipstates maneuver

}

//revalidate_maneuver_button_colors is needed to undo upgrades like r4 astromech which temporarily change color from what the dial shows
function revalidate_maneuver_button_colors(ship_config){

	for (var move_name in ship_config.move_sets.maneuver_set) {
		
		var [speed,bearing_direction] = move_name.split("-");
		
		//$("#" + speed + "-" + bearing_direction).parent().removeClass("invisible"); //make button visible because it's maneuver exists in the ship
		
		var maneuver_color = ship_config.move_sets.maneuver_set[move_name].color;

		if(ship_config.upgrades.r4_astromech && maneuver_color != blue && (ship_config.move_sets.maneuver_set[move_name].speed == 1 || ship_config.move_sets.maneuver_set[move_name].speed == 2)){
			maneuver_color-=1;
		}

		switch(maneuver_color){
			case red:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case blue:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case white:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("white-maneuver")
				break;
		}
	}
}

//updates button enable/disable state based on press of other buttons, i.e. re-validates "select all" buttons
function process_maneuver_button_change(element){

	var label_element = element;
	var input_element = $(element).children()[0];
	var maneuver_buttons = get_button_states(".maneuver-option");

	var [input_speed, input_bearing_direction] = input_element.id.split("-");
	var new_state = $(input_element).is(":checked");
	
	var has_speed = {};
	var has_bearing_direction = {};
	var has_all = true;

	for (maneuver_button in maneuver_buttons) {
		var [speed,bearing_direction] = maneuver_button.split("-");
		if(speed != "all" && bearing_direction != "all"){
			has_speed[speed] = true;
			has_bearing_direction[bearing_direction] = true;
		}
		if (
			input_speed == "all" && 
			(bearing_direction == input_bearing_direction || input_bearing_direction == "all") &&
			speed != "all"){
			change_button_state(speed+"-"+bearing_direction,new_state);
		}
		if (input_bearing_direction == "all" && (speed == input_speed || input_speed == "all") && bearing_direction != "all"){
			change_button_state(speed+"-"+bearing_direction,new_state);
		}
	}

	maneuver_buttons = get_button_states(".maneuver-option");
	for (maneuver_button in maneuver_buttons) {
			var [speed,bearing_direction] = maneuver_button.split("-");
			if(speed != "all" && bearing_direction != "all"){
				if(!maneuver_buttons[maneuver_button]){
					has_speed[speed] = false;
					has_bearing_direction[bearing_direction] = false;
					has_all = false;
				}
			}
	}

	for (speed in has_speed){
		if(input_speed != speed || input_bearing_direction != "all"){
			change_button_state(speed+"-all",has_speed[speed]);
		}
	}

	for (bearing_direction in has_bearing_direction){
		if(input_speed != "all" || input_bearing_direction != bearing_direction){
			change_button_state("all-"+bearing_direction,has_bearing_direction[bearing_direction]);
		}
	}
	if(input_speed != "all" || input_bearing_direction != "all"){
		change_button_state("all-all",has_all);
	}


}

function update_css_for_viewport_size(){

    var right_of_fixed = $('#layer0').width() + 10;
  	var bottom_of_fixed = $('#fixed_canvas_container').position().top + $('#fixed_canvas_container').height();

    $('#fixed_canvas_container').addClass("fixed_canvas");
    $('#pure-toggle-left').addClass("fixed_canvas");
	
	if($( window ).width() > right_of_fixed+378){
      $('#scrollable_buttons_area').css('margin-left',right_of_fixed);
      $('#scrollable_buttons_area').css('margin-top',"0px");
      $('#scrollable_buttons_area').removeClass("buttons_area_below");
      $('#scrollable_buttons_area').addClass("buttons_area_right");

  } else {
  	  var start_of_content = $('#fixed_canvas_container').position().top + $('#fixed_canvas_container').height();
  	  var left_side = ($( window ).width()>384) ? (($( window ).width()-384)/2).toString() + "px" : "0px";
      $('#scrollable_buttons_area').css('margin-left',left_side);
      $('#scrollable_buttons_area').css('margin-top',bottom_of_fixed);
      $('#scrollable_buttons_area').removeClass("buttons_area_right");
      $('#scrollable_buttons_area').addClass("buttons_area_below");
      if($( window ).height()-bottom_of_fixed < 285){
      	$('#fixed_canvas_container').removeClass("fixed_canvas");
 		$('#pure-toggle-left').removeClass("fixed_canvas");
      }
  }
}

var options = {};
var ship_config = new ShipConfig();

$(document).ready(function(){
    $(window).on('resize', function(){
    	update_css_for_viewport_size();      
	});

    update_css_for_viewport_size();    


	process_faction_change(get_selected_radio_option(".faction-option"),ship_config);
	options = get_button_states(".display-option");
	draw_everything(generate_shipstates(ship_config,options),options,c);

	$(".display-option").change(function(){
		options = get_button_states(".display-option");
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$(".faction-option").change(function(){
		process_faction_change($(this).children()[0].id,ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$(".ship-option").change(function(){
		process_ship_change($(this).children()[0].id,ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	}); 

	$(".maneuver-option").change(function(){
		process_maneuver_button_change(this,ship_config);
		ship_config.update_maneuver_set();
		draw_everything(generate_shipstates(ship_config,options),options,c);
	}); 

	$(".pilot-option").change(function(){
		process_pilot_change($(this).children()[0].id,ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$(".upgrade-option").change(function(){
		process_upgrade_buttons(ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});
    
});