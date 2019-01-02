function ShipConfig(){

	this.ship_name = "default";
	this.ship_id = "default";
	this.faction_name = "";
	this.basesize = SMALLBASE;
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
		var translate_direction = [LEFT,LEFT,NORMAL,RIGHT,RIGHT,NORMAL,LEFT,RIGHT,LEFT,RIGHT,LEFT,NORMAL,RIGHT];
		var translate_direction_name = ["left","left","","right","right","","left","right","left","right","left","","right"];
		var translate_color = [NONE,WHITE,BLUE,RED];
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


		this.basesize = SMALLBASE;
		this.basesize = (yasb_ship.large) ? LARGEBASE : this.basesize;
		this.basesize = (yasb_ship.medium) ? MEDIUMBASE : this.basesize;
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
					this.move_sets.roll_set[move_name].color = RED;
				}
			} else if (yasb_ship.actionsred[i]=="Boost"){
				this.action_bar.push(yasb_ship.actionsred[i]);
				for(var move_name in this.move_sets.boost_set){
					this.move_sets.boost_set[move_name].color = RED;
				}
			}
		}

		for (var speed = 0; speed < yasb_ship.maneuvers.length; speed++) {
			for (var i = 0; i < yasb_ship.maneuvers[speed].length; i++){
				if(translate_color[yasb_ship.maneuvers[speed][i]] != NONE){
					var new_maneuver;
					if(translate_bearing[i] == "talon"){
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: NORMAL,slide: true,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable, draw_type: 0};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					} else {
						new_maneuver = {bearing:translate_bearing[i],speed: speed*translate_speed_polarity[i],direction: translate_direction[i],	roll_direction: NORMAL,slide: false,color: translate_color[yasb_ship.maneuvers[speed][i]],enabled: default_enable, draw_type: 0};
						this.move_sets.maneuver_set[(speed*translate_speed_polarity[i]).toString().replace(/^-/,"m")+"-"+translate_bearing[i]+translate_direction_name[i]] = new_maneuver;
					}
					
				}
			}
		}
	}


	this.update_maneuver_set = function() {
    
	  	for (var move_name in this.move_sets.maneuver_set) {
	  		this.move_sets.maneuver_set[move_name].enabled = ($("#"+move_name).is(":checked")) ? true : false;
	  	}
	}
}


//process faction change
//asigns faction name to ship_config
//makes only valid ships for this faction visible
//selects the first ship as the active ship
//calls process_ship_change with the first ship
function process_faction_change(faction_id,ship_config){
	var ship_buttons = get_button_states("[data-ship-option]");
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
	var pilot_buttons = get_button_states("[data-pilot-option]");
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

	//step3
	var maneuver_buttons = get_button_states("[data-maneuver-option]");

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
			case RED:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case BLUE:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case WHITE:
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
	var upgrade_buttons = get_button_states("[data-upgrade-option]");

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
		upgrade_buttons = get_button_states("[data-" + pilots_by_ship[ship_config.ship_name][0].slots[slot].toLowerCase() + "-option]");
		for (upgrade_id in upgrade_buttons) {
			if (
			  upgrade_id.substring(0,3) != "no_" &&
			  is_upgrade_valid(pilots_by_ship[ship_config.ship_name][0].slots[slot],upgrade_id,ship_config) 
  			) {
				$($("#" + upgrade_id).parent()).removeClass("d-none"); 
				slot_with_available_options.push(pilots_by_ship[ship_config.ship_name][0].slots[slot].toLowerCase());
			}
		}
	}

    $("[data-upgrade-group]").each(function() {
    	var [slot_name,dummy] = this.id.split("-");
    	if($.inArray(slot_name,slot_with_available_options)!=-1){
    		$(this).removeClass("d-none");
    	} else if (slot_name == "talent" && $.inArray("force",slot_with_available_options)!=-1) {
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
	var upgrade_buttons = get_button_states("[data-talent-option]");
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

	upgrade_buttons = get_button_states("[data-force-option]");
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

		ship_config.upgrades = get_button_states("[data-upgrade-option]");

		if(ship_config.upgrades.daredevil){
			ship_config.move_sets.boost_set["daredevil-left"] = {bearing:"turn",speed: 1,direction: LEFT,roll_direction: NORMAL,slide: false,color: RED,enabled: true};
			ship_config.move_sets.boost_set["daredevil-right"] = {bearing:"turn",speed: 1,direction: RIGHT,roll_direction: NORMAL,slide: false,color: RED,enabled: true};
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

		if(ship_config.upgrades.r4_astromech && maneuver_color != BLUE && (ship_config.move_sets.maneuver_set[move_name].speed == 1 || ship_config.move_sets.maneuver_set[move_name].speed == 2)){
			maneuver_color-=1;
		}

		switch(maneuver_color){
			case RED:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case BLUE:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("white-maneuver")
				break;
			case WHITE:
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("red-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).removeClass("blue-maneuver")
				$($("#"+speed+"-"+bearing_direction).parent().children()[1]).addClass("white-maneuver")
				break;
		}
	}
}

//updates button enable/disable state based on press of other buttons, i.e. re-validates "select all" buttons
function process_maneuver_button_change(element){

	// var label_element = element;
	var input_element = element;
	var maneuver_buttons = get_button_states("[data-maneuver-option]");

	if(input_element[0] == document){
		var [input_speed, input_bearing_direction] = ["null","null"];
		var new_state = true;
	} else {
		var [input_speed, input_bearing_direction] = input_element.id.split("-");
		var new_state = $(input_element).is(":checked");
	}
	
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

	maneuver_buttons = get_button_states("[data-maneuver-option]");
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