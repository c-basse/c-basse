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

function ShipState(basesize,actions_remaining){

	this.basesize = basesize || smallbase;
	this.actions_remaining = actions_remaining || [];

	this.movearray = [];
	this.stress_count = 0;
	this.actions_used = [];
	this.frozen = false;
	this.has_moved = false;
	this.is_cloaked = false;
	this.actions_disabled = false;
	this.slide_array = [];
	this.slam_speed = 99;
	this.force_count = 0;

	this.execute_moves = function() {
		for (var i = 0;  i < this.movearray.length; i++) {
			this.execute_move(this.movearray[i])
		}
	}

	this.draw = function() {
		c.save();
		this.execute_moves();		
		c.moveTo(0,0);
		c.beginPath();
		c.lineTo(this.basesize/2,0);
		c.lineTo(this.basesize/2,this.basesize);
		c.lineTo(-1*this.basesize/2,this.basesize);
		c.lineTo(-1*this.basesize/2,0);
		c.lineTo(this.basesize/2,0);

		if (this.stress_count >= 1) {
			c.strokeStyle = '#ff0000';
		} else {
			c.strokeStyle = '#000000';
		}

		c.stroke();
		c.beginPath();
		c.arc(0,10,5,0,2*Math.PI);
		c.stroke();

		c.restore();
	}

	this.add_move = function(maneuver) {
		this.movearray.push(maneuver);
	}

	this.execute_move = function(maneuver){
		var bearing = maneuver.bearing;
		var speed = maneuver.speed;
		var direction = maneuver.direction;
		var roll_direction = maneuver.roll_direction || normal; //normal means not a roll
		var slide_direction = maneuver.slide_direction || mid;
		var radius;
		if (roll_direction != 0) {
			this.execute_move({bearing:"rotate",speed:90,direction:roll_direction});
			if(this.basesize > smallbase){
				this.execute_move({bearing:bearing,speed:speed/2,direction:direction});
			} else {
				this.execute_move({bearing:bearing,speed:speed,direction:direction});
			}
			this.execute_move({bearing:"rotate",speed:90,direction:-1*roll_direction});
			
			if(this.basesize > smallbase){
				c.translate(0,-1*slide_distance*2*slide_direction);
			} else {
				c.translate(0,-1*slide_distance*slide_direction);
			}
		} else if (speed < 0) {
			this.execute_move({bearing:"rotate",speed:180,direction:right});
			this.execute_move({bearing:bearing,speed:speed*-1,direction:direction*-1});
			this.execute_move({bearing:"rotate",speed:180,direction:right});
		} else {
			switch(bearing) {
				case "straight":
					switch(speed) {
							case 0:
						this.execute_move({bearing:"straight",speed:-1});
						this.execute_move({bearing:"straight",speed:+1});
							break;
						default:
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
					c.translate(direction*radius*(1-Math.cos(Math.PI*45/180)),-radius*Math.sin(Math.PI*45/180));
					c.rotate(direction * 45 * Math.PI / 180);
					c.translate(0,-1*this.basesize);
					break;
				case "sloop":
					this.execute_move({bearing:"bank",speed:speed,direction:direction});
					this.execute_move({bearing:"rotate",speed:180,direction:right});
					break;
				case "talon":
					this.execute_move({bearing:"turn",speed:speed,direction:direction});
					this.execute_move({bearing:"rotate",speed:90,direction:direction});
					c.translate(0,-1*slide_distance*slide_direction);
					break;
				case "kturn":
					this.execute_move({bearing:"straight",speed:speed,direction:direction});
					this.execute_move({bearing:"rotate",speed:180,direction:right});
					break;
				case "stop":
					this.execute_move({bearing:"straight",speed:-1});
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
		var cloned_shipstate = new ShipState(this.basesize,this.actions_remaining.slice(0));
		cloned_shipstate.movearray = this.movearray.slice(0);
		cloned_shipstate.stress_count = this.stress_count;
		cloned_shipstate.actions_used = this.actions_used.slice(0);
		cloned_shipstate.has_moved = this.has_moved;
		cloned_shipstate.is_cloaked = this.is_cloaked;
		cloned_shipstate.actions_disabled = this.actions_disabled;
		cloned_shipstate.slide_array = this.slide_array.slice(0);
		cloned_shipstate.slam_speed = this.slam_speed;
		cloned_shipstate.force_count = this.force_count;
		return cloned_shipstate;
	}
}

function ShipConfig(){

	this.ship_name = "default";
	this.faction_name = "";
	this.basesize = smallbase;
	this.actions = [];
	this.move_sets = {
		roll_set: {},
		boost_set: {},
		decloack_set: {},
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
		this.move_sets.decloack_set = $.extend(true, {}, standard_decloak_set);
		this.move_sets.aileron_set = $.extend(true, {}, standard_boost_set);
		this.move_sets.maneuver_set = {};

		this.actions = yasb_ship.actions.slice(0);
		for(var i=0; i< yasb_ship.actionsred.length; i++){
			if(yasb_ship.actionsred[i]=="Barrel Roll"){
				this.actions.push(yasb_ship.actionsred[i]);
				for(var move_name in this.move_sets.roll_set){
					this.move_sets.roll_set[move_name].color = red;
				}
			} else if (yasb_ship.actionsred[i]=="Boost"){
				this.actions.push(yasb_ship.actionsred[i]);
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
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: normal,slide: true,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					} else {
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: normal,slide: false,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					}
					
				}
			}
		}
	}


	this.update_maneuver_set = function() {
    
	    var parent_elements = $(".maneuver-option");

	  	for (var move_name in this.move_sets.maneuver_set) {
	  		var direction = "";
	  		if (this.move_sets.maneuver_set[move_name].direction == left) {
	  			direction = "left";
	  		} else if (this.move_sets.maneuver_set[move_name].direction == right) {
	  			direction = "right";
	  		}
	  		this.move_sets.maneuver_set[move_name].enabled = ($(parent_elements.children("#"+move_name)[0]).is(":checked")) ? true : false;
	  	}
	}
}

function draw_everything(shipstateArray,options,canvas) {

	canvas.setTransform(1, 0, 0, 1, 0, 0);
  	canvas.clearRect(0, 0, layer0.width, layer0.height);
  	canvas.translate(layer0.width/2,layer0.height-200);

	for (var i = 0; i < shipstateArray.length; i++) {
			if (
					(
						(options.show_intermediate_location && i>0 && !shipstateArray[i].has_moved) ||
						(options.show_final_location && shipstateArray[i].has_moved) ||
						(options.show_starting_location && i == 0)
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
				shipstateArray[i].draw();
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

//process_ship_change
//step1, update ship config with the new ship
//step2, select default pilot and set only valid (right ship, right faction) pilot options to show
//step3, setup the maneuver selection area based on available maneuvers and their color
//step4, calls process_pilot_change with the default "none" pilot for this ship
//step5, calls process_maneuver_button_change
//step6, calls update_maneuver_set
function process_ship_change(ship_id,ship_config){
	var yasb_ship_name = translate_id_to_yasb_name(ship_id);

	//step1
	ship_config.change_ship(basicCardData().ships[yasb_ship_name]);

	//step2
	var default_pilot_id;
	var pilot_buttons = get_button_states(".pilot-option");
	for (pilot_id in pilot_buttons){
		yasb_pilot_name = translate_id_to_yasb_name(pilot_id);
		
		if(pilot_id == "no_pilot"){
			$($("#" + pilot_id).parent()).removeClass("d-none"); 
			default_pilot_id = pilot_id;
			change_button_state(pilot_id,true);
			continue;
		}

		change_button_state(pilot_id,false); 
		var pilot_found = false;
		for(i=1;i<pilots_by_ship[yasb_ship_name].length;i++){
			if(pilots_by_ship[yasb_ship_name][i].pilot_name==yasb_pilot_name && pilots_by_ship[yasb_ship_name][i].faction==ship_config.faction_name){
			 	$($("#" + pilot_id).parent()).removeClass("d-none");	
			 	pilot_found = true
			 	break;
			}
		}
		if(!pilot_found){
			$($("#" + pilot_id).parent()).addClass("d-none");
		}
	}

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
		}
		if (bearing_direction != "all") {
			has_bearing_direction[bearing_direction] = false;
		}
	}


	for (var move_name in ship_config.move_sets.maneuver_set) {
		var direction_name = "";
		if (ship_config.move_sets.maneuver_set[move_name].direction == left) {
			direction_name = "left";
		} else if (ship_config.move_sets.maneuver_set[move_name].direction == right) {
			direction_name = "right";
		}
		var [speed,bearing_direction] = move_name.split("-");
		//var speed = ship_config.move_sets.maneuver_set[move_name].speed;
		//var bearing_direction = ship_config.move_sets.maneuver_set[move_name].bearing+direction_name;

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
		}
		if(!has_bearing_direction[bearing_direction] && bearing_direction != "all"){
			$($("#" + maneuver_button).parent()).addClass("d-none"); 
			$("#" + "all" + "-" + bearing_direction).parent().addClass("d-none"); 
		}
	}
	process_pilot_change(default_pilot_id,ship_config);
	process_maneuver_button_change($(document));
	ship_config.update_maneuver_set();
}

//process_pilot_change
//updates ship_config with pilot
//setup upgrade buttons with valid options and reset all upgrade choices to default (none)
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

	var upgrade_buttons = get_button_states(".upgrade-option");

	for (upgrade_id in upgrade_buttons){
		if(upgrade_id.substring(0,3) == "no_"){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
			change_button_state(upgrade_id,true);
			continue;
		} else {
			change_button_state(upgrade_id,false);
		}

		if (
		$.inArray("Tech",ship_config.pilot.slots)>=0 && $($("#" + upgrade_id).parent()).hasClass("tech-option") &&
		(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase))
		{
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
		} else if ($($("#" + upgrade_id).parent()).hasClass("tech-option")) {
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}

		if ($.inArray("Sensor",ship_config.pilot.slots)>=0 && $($("#" + upgrade_id).parent()).hasClass("sensor-option") &&
		(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase)){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
		} else if ($($("#" + upgrade_id).parent()).hasClass("sensor-option")) {
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}

		if ($.inArray("Talent",ship_config.pilot.slots)>=0 && $($("#" + upgrade_id).parent()).hasClass("talent-option") &&
		(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase) &&
		(!($($("#" + upgrade_id).parent()).hasClass("requiresboost")) || $.inArray("Boost",ship_config.actions)>-1)){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
		} else if ($($("#" + upgrade_id).parent()).hasClass("talent-option")) {
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}

		if ($.inArray("Force",ship_config.pilot.slots)>=0 && $($("#" + upgrade_id).parent()).hasClass("force-option") &&
		(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase)){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
		} else if ($($("#" + upgrade_id).parent()).hasClass("force-option")) {
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}

		if ($.inArray("Crew",ship_config.pilot.slots)>=0 && $($("#" + upgrade_id).parent()).hasClass("crew-option") &&
		(!($($("#" + upgrade_id).parent()).hasClass("smallbaseonly")) || ship_config.basesize == smallbase)){
			$($("#" + upgrade_id).parent()).removeClass("d-none"); 
		} else if ($($("#" + upgrade_id).parent()).hasClass("crew-option")) {
			$($("#" + upgrade_id).parent()).addClass("d-none"); 
		}
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

var options = {};
var ship_config = new ShipConfig();

$(document).ready(function(){

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
		process_maneuver_button_change(this);
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