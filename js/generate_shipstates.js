/*
generate_shipstates() is the main brain of running through a turn of xwing for all valid and enabled maneuver combinations
output: the array of every possible shipstate
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades and pilots are enabled
Required Input options (options dictionary object) is needed as it determines starting ship state and other options such as slide choices
*/
function generate_shipstates(ship_config, options) {

	var starting_point = new ShipState(ship_config.basesize);
	var shipstateArray = [];
	starting_point.force_count = ship_config.pilot.starting_force;
    
    //enable or disable special maneuver sets
    if(ship_config.pilot.pilot_name == "IG-88D") {
    	ship_config.move_sets.maneuver_set["3-ig88dright"].enabled = ship_config.move_sets.maneuver_set["3-sloopright"].enabled;
    	ship_config.move_sets.maneuver_set["3-ig88dleft"].enabled = ship_config.move_sets.maneuver_set["3-sloopleft"].enabled;
    	ship_config.move_sets.maneuver_set["3-kturn"].enabled = (ship_config.move_sets.maneuver_set["3-sloopright"].enabled || ship_config.move_sets.maneuver_set["3-sloopleft"].enabled);
    }
    else if (ship_config.pilot.pilot_name == "Countess Ryad") {
    	ship_config.move_sets.maneuver_set["2-ryadturn"].enabled = ship_config.move_sets.maneuver_set["2-straight"].enabled;
    	ship_config.move_sets.maneuver_set["3-ryadturn"].enabled = ship_config.move_sets.maneuver_set["3-straight"].enabled;
    	ship_config.move_sets.maneuver_set["4-ryadturn"].enabled = ship_config.move_sets.maneuver_set["4-straight"].enabled;
    	ship_config.move_sets.maneuver_set["5-ryadturn"].enabled = ship_config.move_sets.maneuver_set["5-straight"].enabled;
    }
    else if (ship_config.upgrades.pivot_wing) {
    	ship_config.move_sets.maneuver_set["left_pivot"].enabled = ship_config.move_sets.maneuver_set["0-straight"].enabled;
    	ship_config.move_sets.maneuver_set["right_pivot"].enabled = ship_config.move_sets.maneuver_set["0-straight"].enabled;
    	ship_config.move_sets.maneuver_set["flip_pivot"].enabled = ship_config.move_sets.maneuver_set["0-straight"].enabled;
    }

    //assign cloak token
	if($.inArray("Cloak",ship_config.action_bar)>=0){
		starting_point.is_cloaked = true;
	}

	//assign stress tokens
	starting_point.stress_count = (options.start_stressed) ? 1 : starting_point.stress_count;
	starting_point.stress_count = (options.start_double_stressed) ? 2 : starting_point.stress_count;
	starting_point.stress_count = (options.start_unstressed) ? 0 : starting_point.stress_count;

	//assign slide options
    if (options.show_bwd_slide) {
    	starting_point.slide_array.push(BWD);
    } else if (options.show_fwd_slide) {
    	starting_point.slide_array.push(FWD);
    } else if (options.show_mid_slide) {
    	starting_point.slide_array.push(MID);
    } else if (options.show_all_slide) {
    	starting_point.slide_array.push(BWD);
    	starting_point.slide_array.push(FWD);
    	starting_point.slide_array.push(MID);
    }

	/*******************************/
	/*******Begin turn**************/
	/*******************************/
	shipstateArray.push(starting_point);

	/*******************************/
	/*******Systems phase***********/
	/*******************************/
	shipstateArray = decloak_phase(shipstateArray, ship_config);

	/*******************************/
	/*******Before you activate*****/
	/*******************************/
	if (ship_config.pilot.pilot_name == "Sabine Wren (TIE Fighter)" || ship_config.pilot.pilot_name == "Sabine Wren"){
		var sabine_action_bar = create_temp_action_bar(ship_config,['Boost','Barrel Roll'],WHITE,true);
		shipstateArray = action_phase(shipstateArray, ship_config, options, sabine_action_bar, {require_move: false});
	}
	if (ship_config.upgrades.supernatural_reflexes){
		var sr_action_bar = create_temp_action_bar(ship_config,['Boost','Barrel Roll'],WHITE,false);
		shipstateArray = action_phase(shipstateArray, ship_config, options, sr_action_bar, {require_move: false,force_cost: 1});
	}

	/*******************************/
	/**Before you reveal your dial**/
	/*******************************/
	if (ship_config.ship_ability.adaptive_ailerons) {
		if(ship_config.pilot.pilot_name == '"Duchess"'){
			shipstateArray = maneuver_phase(shipstateArray, ship_config.move_sets.aileron_set, ship_config, options, {intermediate_move: true, must_iff_unstressed: false});
		} else {
			shipstateArray = maneuver_phase(shipstateArray, ship_config.move_sets.aileron_set, ship_config, options, {intermediate_move: true, must_iff_unstressed: true});
		}
	}

	/*******************************/
	/**After you reveal your dial***/
	/*******************************/
	if (ship_config.upgrades.advanced_sensors) {
		shipstateArray = action_phase(shipstateArray, ship_config, options, ship_config.action_bar, {require_move: false, disable_future_actions: true, slam_allowed: false});
	}

	/*******************************/
	/*Before you execute a maneuver*/
	/*******************************/
	if (ship_config.upgrades.bb_astromech){
		var bb_action_bar = create_temp_action_bar(ship_config,['Barrel Roll'],WHITE,true);
		shipstateArray = action_phase(shipstateArray, ship_config, options, bb_action_bar, {require_move: false});
	}
	if (ship_config.upgrades.bb_8){
		var bb8_action_bar = create_temp_action_bar(ship_config,['Boost','Barrel Roll'],WHITE,true);
		shipstateArray = action_phase(shipstateArray, ship_config, options, bb8_action_bar, {require_move: false});
	}

	/*******************************/
	/*******Execute a Maneuver******/
	/*******************************/
	shipstateArray = maneuver_phase(shipstateArray, ship_config.move_sets.maneuver_set, ship_config, options, {record_slam_speed: true});

	/*******************************/
	/*******Perform Action**********/
	/*******************************/
	shipstateArray = action_phase(shipstateArray, ship_config, options, ship_config.action_bar);

	return shipstateArray;
}

/*
maneuver_phase() is a daughter-function for generate_shipstates to execute an xwing maneuver
Output: an updated ShipState array
Required Input shipstateArray (array of ShipState object) is needed as every incoming ShipState will ahve all valid and enabled maneuver phase outcomes executed on it.
Required Input move_set (dictionary object of maneuvers) this will be the set of all possible maneuvers to execute
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
Optional Input intermediate_move, if true the maneuvers executed will not count as the required "dial maneuver" for this ships activation, i.e. ailerons
Otional Input must_iff_unstressed, if true the maneuver will only happen for shipstates which are not stressed; AND the if incomign seed ship state is not stressed, the incoming seed ship state will be "frozen" as is no longer a valid seed for future moves
Optional Input record_slam_speed, this indicates that this maneuver is valid for determining future slam speed
*/
function maneuver_phase(shipstateArray, move_set, ship_config, options, {
	intermediate_move = false,
	must_iff_unstressed = false,
	record_slam_speed = false
}={}) {
	
	var new_shipstateArray = [];
	
	for (var i=0; i<shipstateArray.length; i++) {
		var performed_emergency_two_straight = false; //this tracks if we have taken an stressed RED maneuever so it doesn't need to happen more than once for any shipstate

		if ( //if not already moved, not frozen (i.e. invalid state that can no longer be used to build on), also you can't be stressed if must_iff_unstressed is true
		  !shipstateArray[i].has_moved &&
		  !shipstateArray[i].frozen &&
		  (shipstateArray[i].stress_count <= 0 || !must_iff_unstressed)
		) {

			if (must_iff_unstressed) {
				shipstateArray[i].frozen = true; //this basically means whatever maneuver we are performing must be performed (e.g. ailerons), so the incoming ship state cannot be used for any other maneuevers
			}

			for (var move_name in move_set) { 

				if (move_set[move_name].enabled) { //maneuver must be enabled
					
					var loop_count = (move_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
					for(var k=0; k<loop_count; k++){
						
						var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},move_set[move_name]);
						var new_ship_state = shipstateArray[i].clone();
						new_ship_state.has_moved = (intermediate_move) ? new_ship_state.has_moved : true;

						if (
						  ship_config.upgrades.r4_astromech &&
						  maneuver.color != BLUE &&
						  (maneuver.speed == 1 || maneuver.speed == 2)
						) {
							maneuver.color -= 1;
						} 

						if ( //if already stressed and this is a RED maneuver, need to execute a emergency WHITE 2 straight (if haven't already)
						  maneuver.color == RED &&
						  (!ship_config.upgrades.reys_falcon || maneuver.bearing != "sloop") &&
						  new_ship_state.stress_count >= 1 &&
						  performed_emergency_two_straight == false
						) { 
							new_ship_state.add_move(stressed_red_maneuver); // do an emergency two straight
							new_ship_state.slam_speed = (record_slam_speed) ? stressed_red_maneuver.speed : new_ship_state.slam_speed;
							performed_emergency_two_straight = true;
							new_shipstateArray.push(new_ship_state);
						}
						else if (
						  maneuver.color != RED ||
						  (ship_config.upgrades.reys_falcon && maneuver.bearing == "sloop") ||
						  new_ship_state.stress_count == 0
						) {
										
							new_ship_state.add_move(maneuver); // do the maneuver
							new_ship_state.slam_speed = (record_slam_speed) ? maneuver.speed : new_ship_state.slam_speed;
							switch (maneuver.color) {

								case RED:
									if(ship_config.upgrades.pattern_analyzer){
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state],ship_config, options, ship_config.action_bar,{force_red:true})); //force_red so they get stressed afterward for the RED maneuver that initiated the action
									}
									if(ship_config.pilot.pilot_name != "Nien Nunb"){
										new_ship_state.stress_count += 1;
									} 
								break;

								case WHITE:

								break;

								case BLUE:

									if(new_ship_state.stress_count > 0){
										new_ship_state.stress_count -= 1;
									}
								break;
							}
							new_shipstateArray.push(new_ship_state);

							if(ship_config.upgrades.afterburners && maneuver.speed >= 3){
								var afterburners_action_bar = create_temp_action_bar(ship_config,['Boost'],WHITE,true);
								new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options, afterburners_action_bar, {require_move: false, even_if_stressed: true}));
							} else if (ship_config.pilot.pilot_name == "Temmin Wexley" && maneuver.speed >= 2 && maneuver.speed <= 4){
								var temmin_action_bar = create_temp_action_bar(ship_config,['Boost'],WHITE,true);
								new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options, temmin_action_bar, {require_move: false}));
							}
						} //end if not needing to performed emergency 2 straight
					} //end for loop of slide maneuvers
				} //end if maneuver enabled
			} //end for loop of maneuver names
		} //end if validate ship state can perform manuevers
	} //end for loop of shipstates
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
Optional Input: force_red means the action is treated as RED even if normally that ship has a WHITE version of the action
Optional Input: force_cost means the action cost force point (or charges) to perform
Optional Input: temp_add_boost means boost can be performed even if not on action bar
Optional Input: temp_add_roll means barrel roll can be performed even if not on action bar
Optional Input: even_if_stressed means the action be performed even if stressed
*/
function action_phase(shipstateArray, ship_config, options, action_bar, {
	require_move = true,
	disable_future_actions = false,
	slam_allowed = true,
	force_red =  false,
	force_white = false,
	force_cost = 0,
	temp_add_boost = false,
	temp_add_roll = false,
	even_if_stressed = false
}={}) {
	
	var new_shipstateArray = [];
	
	for (var i=0; i<shipstateArray.length; i++) {
		
		if ( //action possible only if unstressed and has already moved and actions not disabled (i.e. adv sensors used)
		  !shipstateArray[i].actions_disabled &&
		  !shipstateArray[i].frozen &&
		  (require_move == false || shipstateArray[i].has_moved)
		) { 
			
			//var action_array = ship_config.action_bar.slice(0);
			
			//add actions not on action bar based on temp_add inputs
			// if(temp_add_boost && $.inArray("Boost",ship_config.action_bar)==-1) {
			// 	action_array.push("Boost");
			// }
			// if(temp_add_roll && $.inArray("Barrel Roll",ship_config.action_bar)==-1){
			// 	action_array.push("Barrel Roll");
			// }

			for (var action_name in action_bar) {
				
				if (
				  $.inArray(action_name,shipstateArray[i].actions_used) == -1 &&
				  force_cost<=shipstateArray[i].force_count
				) { //make sure this action has not already been performed
					var actions_move_set;
					var white_action_override;
					var red_action_override;
					var is_slam = false; //for slam
					var moveless_action = false;
					var do_action = false;

					switch(action_name) {

						case "Barrel Roll":
							if (
							  //roll_allowed &&
							  options.enable_roll &&
							  (
							   shipstateArray[i].stress_count <= 0 ||
							   (ship_config.upgrades.primed_thrusters && shipstateArray[i].stress_count <= 2) ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = ship_config.move_sets.roll_set;
								white_action_override = ship_config.upgrades.expert_handling || force_white;
								red_action_override = force_red;
							}
						break;

						case "Boost":
							if (
							  //boost_allowed &&
							  options.enable_boost &&
							  (
						  	   shipstateArray[i].stress_count <= 0 ||
						  	   (ship_config.upgrades.primed_thrusters && shipstateArray[i].stress_count <= 2) ||
						  	   (ship_config.upgrades.reys_falcon && shipstateArray[i].stress_count <= 2) ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = ship_config.move_sets.boost_set;
								white_action_override = ship_config.upgrades.engine_upgrade || force_white;
								red_action_override = force_red;
							}
						break;

						case "Slam":

							if (
							  slam_allowed &&
							  options.enable_slam &&
							  (
							   shipstateArray[i].stress_count == 0 ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = ship_config.move_sets.maneuver_set; 
								white_action_override = force_white;
								red_action_override = force_red;
								is_slam = true;
							}
						break; 

						case "Rotate Arc":

							if (
							  //rotate_allowed &&
							  options.enable_rotate &&
							  (
							   shipstateArray[i].stress_count == 0 ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = {"rotate-arc": {bearing:"straight",speed: 0,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0}}; 
								white_action_override = force_white;
								red_action_override = force_red;
								moveless_action = true;
							}
						break;

						case "Focus":

							if (
							  (
							   shipstateArray[i].stress_count == 0 ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = {"rotate-arc": {bearing:"straight",speed: 0,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0}}; 
								white_action_override = force_white;
								red_action_override = force_red;
								moveless_action = true;
							}

						break;

						case "Calculate":

							if (
							  (
							   shipstateArray[i].stress_count == 0 ||
							   even_if_stressed
							  )
							) {
								do_action = true;
								actions_move_set = {"rotate-arc": {bearing:"straight",speed: 0,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0}}; 
								white_action_override = force_white;
								red_action_override = force_red;
								moveless_action = true;
							}

						break;
						}

					if (do_action) {
						//code below is common for all actions
						for (var move_name in actions_move_set) {
							if (
							  (!is_slam || ship_config.move_sets.maneuver_set[move_name].speed == shipstateArray[i].slam_speed) &&
							  (actions_move_set[move_name].enabled || is_slam)
							) {
								var loop_count = (actions_move_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
								for (var k=0; k<loop_count; k++) {
									
									var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},actions_move_set[move_name]); 	
									var new_ship_state = shipstateArray[i].clone();
									
									if(!moveless_action){
										new_ship_state.add_move(maneuver);
									}
									new_ship_state.force_count -= force_cost;
									if(disable_future_actions){
										new_ship_state.actions_disabled = true;
									}
									if(is_slam && !ship_config.upgrades.black_one){
										new_ship_state.is_disarmed = true;
									}
									
									var difficulty = action_bar[action_name].color;
									difficulty = (white_action_override) ? WHITE : difficulty;
									difficulty = (red_action_override) ? RED : difficulty;
									switch (difficulty) {          //check color
										case RED:
											if(ship_config.pilot.pilot_name != "Nien Nunb"){
												new_ship_state.stress_count += 1;
											}
											break;
										case BLUE:
											if(new_ship_state.stress_count > 0){
												new_ship_state.stress_count -= 1;
											}
											break;
									}

									if(is_slam){
										difficulty = actions_move_set[move_name].color;
										switch (difficulty) {          //check color
											case RED:
												if(ship_config.pilot.pilot_name != "Nien Nunb"){
													new_ship_state.stress_count += 1;
												}
												break;
											case BLUE:
												if(new_ship_state.stress_count > 0){
													new_ship_state.stress_count -= 1;
												}
												break;
										}
									}

									new_ship_state.actions_used.push(action_name); 
									new_shipstateArray.push(new_ship_state);
									
									if(ship_config.ship_ability.autothrusters){
										var autothrusters_action_bar = create_temp_action_bar(ship_config,['Boost','Barrel Roll'],RED,true);
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options,autothrusters_action_bar, {require_move: false}));
									} else if (ship_config.ship_ability.refined_gyrostabilizers) {
										var ref_gyro_action_bar = create_temp_action_bar(ship_config,['Boost','Rotate Arc'],RED,true);
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options, ref_gyro_action_bar, {require_move: false}));
									} else if (ship_config.ship_ability.vectored_thrusters) {
										var vec_thrust_action_bar = create_temp_action_bar(ship_config,['Boost'],RED,true);
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options,vec_thrust_action_bar, {require_move: false}));
									} else if (ship_config.pilot.pilot_name == "Poe Dameron" && new_ship_state.force_count >= 1){
										var poe_action_array = [];
										for(var poe_action_name in ship_config.action_bar){
											if(ship_config.action_bar[poe_action_name].color == WHITE){
												poe_action_array.push(poe_action_name);
											}
										}
										var poe_action_bar = create_temp_action_bar(ship_config,poe_action_array,RED,false);
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options, poe_action_bar, {require_move: false, slam_allowed: false, force_cost: 1}));
									} else if ('link' in action_bar[action_name]) {
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, options, action_bar[action_name]['link'], {require_move: false}));
									}
									/*
									until we model the ability to supernatural boost (take damage) and/or other actions, vader pilot ability is pointless
									if(ship_config.pilot.pilot_name="Darth Vader"){
										new_shipstateArray = new_shipstateArray.concat(action_phase([new_ship_state], ship_config, {require_move: false, disable_future_actions: false,force_cost:1}));
									}
									*/
								} // end for loop of slide maneuvers
							} //end if maneuver enabled or allowed by slam
						} //end for loop of possible moves
					} //end if valid action has been setup
				} //end if action not already performed and enough charges to afford it
			} //end for of all possible actions
		} //end if any action is allowed in the current state
	} //end for loop of all ship states
	return shipstateArray.concat(new_shipstateArray);
}

/*
decloak_phase() is a daughter-function for generate_shipstates to execute an xwing decloak
Output: an updated ShipState array
Required Input shipstateArray (array of ShipState object) is needed as every incoming ShipState will ahve all valid and enabled action phase outcomes executed on it.
Required Input ship_config (ShipConfig object) is needed as it holds which upgrades are enabled
*/
function decloak_phase(shipstateArray, ship_config) {
	new_shipstateArray = [];
	for (var i=0; i<shipstateArray.length; i++) {
		if(!shipstateArray[i].frozen && shipstateArray[i].is_cloaked && shipstateArray[i].has_moved == false) { //action possible only if cloaked and has not moved
			for (var move_name in ship_config.move_sets.decloak_set) {
				if (ship_config.move_sets.decloak_set[move_name].enabled) { //maneuver must be enabled
					var loop_count = (ship_config.move_sets.decloak_set[move_name].slide) ? shipstateArray[i].slide_array.length : 1; //only do once if not a slide maneuver; otherwise repeat for however many slide options are enabled
					for(var k=0; k<loop_count; k++){
						var maneuver = $.extend(true,{slide_direction: shipstateArray[i].slide_array[k]},ship_config.move_sets.decloak_set[move_name]); 
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