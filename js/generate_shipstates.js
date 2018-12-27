/*
generate_shipstates() is the main brain of running through a turn of xwing for all valid and enabled maneuver combinations
output: the array of every possible shipstate
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
Required Input options (options dictionary object) is needed as it determines starting ship state and other options such as slide choices
*/
function generate_shipstates(ship_config, options) {
	var starting_point = new ShipState(ship_config.basesize,ship_config.actions);
	starting_point.force_count = ship_config.pilot.starting_force;
	
	if($.inArray("Cloak",ship_config.actions)>=0){
		starting_point.is_cloaked = true;
	}
	var shipstateArray = [];

	starting_point.stress_count = (options.start_stressed) ? 1 : starting_point.stress_count;
	starting_point.stress_count = (options.start_double_stressed) ? 2 : starting_point.stress_count;
	starting_point.stress_count = (options.start_unstressed) ? 0 : starting_point.stress_count;

    if (options.show_bwd_slide) {
    	starting_point.slide_array.push(bwd);
    } else if (options.show_fwd_slide) {
    	starting_point.slide_array.push(fwd);
    } else if (options.show_mid_slide) {
    	starting_point.slide_array.push(mid);
    } else if (options.show_all_slide) {
    	starting_point.slide_array.push(bwd);
    	starting_point.slide_array.push(fwd);
    	starting_point.slide_array.push(mid);
    }

	shipstateArray.push(starting_point);

	//Systems phase
	shipstateArray = decloack_phase(shipstateArray, ship_config);

	//Before you activate
	if (ship_config.upgrades.supernatural_reflexes){
		shipstateArray = action_phase(shipstateArray, ship_config, {require_move: false, slam_allowed: false, force_cost: 1});
	}

	//Before you reveal your dial
	if (ship_config.ship_ability.adaptive_ailerons) {
		shipstateArray = maneuver_phase(shipstateArray, ship_config.move_sets.aileron_set, ship_config, {intermediate_move: true, must_if_unstressed: true});
	}

	//After you reveal your dial
	if (ship_config.upgrades.advanced_sensors) {
		shipstateArray = action_phase(shipstateArray, ship_config, {require_move: false, disable_future_actions: true, slam_allowed: false});
	}

	//Execute maneuver
	shipstateArray = maneuver_phase(shipstateArray, ship_config.move_sets.maneuver_set, ship_config, {record_slam_speed: true});
	shipstateArray = action_phase(shipstateArray, ship_config);

	return shipstateArray;
}

/*
maneuver_phase() is a daughter-function for generate_shipstates to execute an xwing maneuver
Output: an updated ShipState array
Required Input shipstateArray (array of ShipState object) is needed as every incoming ShipState will ahve all valid and enabled maneuver phase outcomes executed on it.
Required Input move_set (dictionary object of maneuvers) this will be the set of all possible maneuvers to execute
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
Optional Input intermediate_move, if true the maneuvers executed will not count as the required "dial maneuver" for this ships activation, i.e. ailerons
Otional Input must_if_unstressed, if true the maneuver will only happen for shipstates which are not stressed; AND the if incomign seed ship state is not stressed, the incoming seed ship state will be "frozen" as is no longer a valid seed for future moves
Optional Input record_slam_speed, this indicates that this maneuver is valid for determining future slam speed
*/
function maneuver_phase(shipstateArray, move_set, ship_config,
	{intermediate_move = false, must_if_unstressed = false, record_slam_speed = false}={}) {
	new_shipstateArray = [];
	for (var i=0; i<shipstateArray.length; i++) {  
		if(!shipstateArray[i].has_moved && !shipstateArray[i].frozen && (shipstateArray[i].stress_count <= 0 || !must_if_unstressed)) { //can only moved in not already moved
			var attempted_stressed_red_maneuver = false;  
			if (must_if_unstressed && shipstateArray[i].stress_count <= 0){
				shipstateArray[i].frozen = true;
			}

			for (var move_name in move_set) { 
				if (move_set[move_name].enabled) { //maneuver must be enabled
					var loop_count = (move_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
					for(var k=0; k<loop_count; k++){
						var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},move_set[move_name]); 
						var ship = shipstateArray[i].clone();
						switch (maneuver.color) { //determine color

							case red:

								if(ship.stress_count >= 1 && attempted_stressed_red_maneuver == false){ //if already stressed and not yet attempted a stressed red maneuver
									ship.add_move(stressed_red_maneuver); // do an emergency two straight
									ship.slam_speed = (record_slam_speed) ? stressed_red_maneuver.speed : ship.slam_speed;
									attempted_stressed_red_maneuver = true;
								} else {
									ship.add_move(maneuver); // do the maneuver
									ship.slam_speed = (record_slam_speed) ? maneuver.speed : ship.slam_speed;
									if(ship_config.upgrades.pattern_analyzer){
										ship.has_moved = true;
										new_shipstateArray = new_shipstateArray.concat(action_phase([ship],ship_config,{require_move:false,force_red:true}));
									}
									ship.stress_count += 1;
								}
								break;

							case white:

								ship.add_move(maneuver); // do the maneuver
								ship.slam_speed = (record_slam_speed) ? maneuver.speed : ship.slam_speed;
								break;

							case blue:

								ship.add_move(maneuver); // do the maneuver
								ship.slam_speed = (record_slam_speed) ? maneuver.speed : ship.slam_speed;
								if(ship.stress_count > 0){
									ship.stress_count -= 1;
								}
								break;
						}	
						ship.has_moved = (intermediate_move) ? ship.has_moved : true;
						new_shipstateArray.push(ship);
					}
				}
			}
		}
	}
	return shipstateArray.concat(new_shipstateArray);
}

/*
action_phase() is a daughter-function for generate_shipstates to execute an xwing action
Output: an updated ShipState array
Required Input shipstateArray (array of ShipState object) is needed as every incoming ShipState will ahve all valid and enabled action phase outcomes executed on it.
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
Optional Input require_move = true means that only shipstates that have already taken their normal "dial" maneuver movement this activation will be able to take this action
Optional Input disable_future_actions means that if a shipstate adds an action here, no further actions are allowed (i.e. adv sensors)
Optional Input: boost_allowed/roll_allowed/slam_allowed are used to restrict to a certain subset of possible actions if needed (e.g. ship abilties)
Optional Input: force_red means the action is treated as red even if normally that ship has a white version of the action
Optional Input: force_cost means the action cost force point to perform
*/
function action_phase(shipstateArray, ship_config,
	{require_move = true, disable_future_actions = false, boost_allowed = true, roll_allowed = true, slam_allowed = true, force_red =  false, force_cost = 0}={}) {
	new_shipstateArray = [];
	for (var i=0; i<shipstateArray.length; i++) {
		if(!shipstateArray[i].frozen && (shipstateArray[i].stress_count <= 0 || (ship_config.upgrades.primed_thrusters && shipstateArray[i].stress_count <= 2)) && (require_move == false || shipstateArray[i].has_moved) && shipstateArray[i].actions_disabled == false) { //action possible only if unstressed and has already moved and actions not disabled (i.e. adv sensors used)
			for (var j = 0; j < shipstateArray[i].actions_remaining.length; j++) {
				switch(shipstateArray[i].actions_remaining[j]) {

					/*improvement opportunity: there is lots of duplicated code betwen different actions, consolidate somehow*/

					case "Barrel Roll":
						if(roll_allowed && force_cost<=shipstateArray[i].force_count){
							for (var move_name in ship_config.move_sets.roll_set) {
								var loop_count = (ship_config.move_sets.roll_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
								for(var k=0; k<loop_count; k++){
									var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},ship_config.move_sets.roll_set[move_name]); 
									if (maneuver.enabled) {                //check if this roll is enabled
										var new_ship_state = shipstateArray[i].clone();
										new_ship_state.add_move(maneuver);
										new_ship_state.force_count -= force_cost;
										if(disable_future_actions){
											new_ship_state.actions_disabled = true;
										}
										var difficulty = (force_red) ? red : maneuver.color;
										switch (difficulty) {          //check color
											case red:
												new_ship_state.stress_count += 1;
												break;
											case blue:
												if(new_ship_state.stress_count > 0){
													new_ship_state.stress_count -= 1;
												}
												break;
										}
										new_shipstateArray.push(new_ship_state);
										new_ship_state.actions_remaining.splice(j,1);
										if(ship_config.ship_ability.autothrusters){
											new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, force_red: true}));
										} else if (ship_config.ship_ability.refined_gyrostabilizers) {
											new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
										} else if (ship_config.ship_ability.vectored_thrusters) {
											new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
										}
										if(ship_config.pilot.pilot_name="Darth Vader"){
											new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false,force_cost:1}));
										}
									}
								}
							}
						}
						break; //break for action name switch
					case "Boost":
						if(boost_allowed && force_cost<=shipstateArray[i].force_count){
							for (var move_name in ship_config.move_sets.boost_set) {
								if (ship_config.move_sets.boost_set[move_name].enabled) {                //check if this boost is enabled
									var new_ship_state = shipstateArray[i].clone();
									new_ship_state.add_move(ship_config.move_sets.boost_set[move_name]);
									new_ship_state.force_count -= force_cost;
									if(disable_future_actions){
										new_ship_state.actions_disabled = true;
									}
									var difficulty = (force_red) ? red : ship_config.move_sets.boost_set[move_name].color;
									switch (difficulty) {          //check color
										case red:
											new_ship_state.stress_count += 1;
											break;
										case blue:
											if(new_ship_state.stress_count > 0){
												new_ship_state.stress_count -= 1;
											}
											break;
									}
									new_shipstateArray.push(new_ship_state);
									new_ship_state.actions_remaining.splice(j,1);
									if(ship_config.ship_ability.autothrusters){
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, force_red: true}));
									} else if (ship_config.ship_ability.refined_gyrostabilizers) {
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
									} else if (ship_config.ship_ability.vectored_thrusters) {
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
									}
								}
							}
						}
						break; //break for action name switch
					case "Slam":
						if(slam_allowed && shipstateArray[i].stress_count == 0 && force_cost<=shipstateArray[i].force_count){ //(need to recheck stress becuase primed thrusters could let something through
							for (var move_name in ship_config.move_sets.maneuver_set) {
								if (ship_config.move_sets.maneuver_set[move_name].speed == shipstateArray[i].slam_speed){
									var new_ship_state = shipstateArray[i].clone();
									new_ship_state.add_move(ship_config.move_sets.maneuver_set[move_name],{intermediate_move: true});
									new_ship_state.force_count -= force_cost;
									if(disable_future_actions){
										new_ship_state.actions_disabled = true;
									}
									var difficulty = (force_red) ? red : ship_config.move_sets.maneuver_set[move_name].color;
									switch (difficulty) {          //check color
										case red:
											new_ship_state.stress_count += 1;
											break;
										case blue:
											if(new_ship_state.stress_count > 0){
												new_ship_state.stress_count -= 1;
											}
											break; 
									}
									new_shipstateArray.push(new_ship_state);
									new_ship_state.actions_remaining.splice(j,1);
									if(ship_config.ship_ability.autothrusters){
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, force_red: true}));
									} else if (ship_config.ship_ability.refined_gyrostabilizers) {
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
									} else if (ship_config.ship_ability.vectored_thrusters) {
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false, slam_allowed: false, roll_allowed: false, force_red: true}));
									}

								}
						}
						break; //break for action name switch
					}
				}
			}
		}
	}
	return shipstateArray.concat(new_shipstateArray);
}

/*
decloak_phase() is a daughter-function for generate_shipstates to execute an xwing decloak
Output: an updated ShipState array
Required Input shipstateArray (array of ShipState object) is needed as every incoming ShipState will ahve all valid and enabled action phase outcomes executed on it.
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
*/
function decloack_phase(shipstateArray, ship_config) {
	new_shipstateArray = [];
	for (var i=0; i<shipstateArray.length; i++) {
		if(!shipstateArray[i].frozen && shipstateArray[i].is_cloaked && shipstateArray[i].has_moved == false) { //action possible only if cloaked and has not moved
			for (var move_name in ship_config.move_sets.decloack_set) {
				if (ship_config.move_sets.decloack_set[move_name].enabled) { //maneuver must be enabled
					var loop_count = (ship_config.move_sets.decloack_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
					for(var k=0; k<loop_count; k++){
						var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},ship_config.move_sets.decloack_set[move_name]); 
						var ship = shipstateArray[i].clone(); 
						ship.add_move(maneuver);
						ship.is_cloaked = false;
						new_shipstateArray.push(ship);
					}
				}
			}
		}
	}
	return shipstateArray.concat(new_shipstateArray);
}