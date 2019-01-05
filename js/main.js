var layer0= document.getElementById("layer0");
var c = layer0.getContext("2d");
var options = {};
var ship_config = new ShipConfig();

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


$(document).ready(function(){

    update_css_for_viewport_size();  

    $(window).on('resize', function(){
    	update_css_for_viewport_size();      
	});

	process_faction_change(get_selected_radio_option("[data-faction-option]"),ship_config);
	options = get_button_states("[data-display-option]");
	draw_everything(generate_shipstates(ship_config,options),options,c);


	$("[data-display-option]").change(function(){
		options = get_button_states("[data-display-option]");
		toggle_hd(options.enable_hd || DATA_COLLECTION_MODE);
    	update_css_for_viewport_size();  
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$("[data-faction-option]").change(function(){
		process_faction_change(this.id,ship_config);
		options = get_button_states("[data-display-option]");
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$("[data-ship-option]").change(function(){
		process_ship_change(this.id,ship_config);
		options = get_button_states("[data-display-option]");
		draw_everything(generate_shipstates(ship_config,options),options,c);
	}); 

	$("[data-maneuver-option]").change(function(){
		process_maneuver_button_change(this,ship_config);
		ship_config.update_maneuver_set();
		draw_everything(generate_shipstates(ship_config,options),options,c);
	}); 

	$("[data-pilot-option]").change(function(){
		process_pilot_change(this.id,ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$("[data-upgrade-option]").change(function(){
		process_upgrade_buttons(ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});  

	/****************************
		Data Collection Mode
	****************************/
	if(DATA_COLLECTION_MODE){
		toggle_hd(DATA_COLLECTION_MODE);
		$( "[data-collect]" ).each(function() {
			$(this).removeClass("d-none");
		});
	}



	$( "#data-collect-all-button" ).click(function() {
		if(DATA_COLLECTION_MODE){
			$("[data-faction-option]").each(function(){
				if(!($($("#"+this.id).parent()).hasClass("d-none"))){
					process_faction_change(this.id,ship_config);
					$("[data-ship-option]").each(function(){
						if(!($($("#"+this.id).parent()).hasClass("d-none"))){
							process_ship_change(this.id,ship_config);
							$("[data-pilot-option]").each(function(){
								if(!($($("#"+this.id).parent()).hasClass("d-none"))){
									process_pilot_change(this.id,ship_config);
									var pilot_name = (this.id.substring(0,3) == "no_") ? "Generic" : ship_config.pilot.pilot_name;
									$("[data-maneuver-option]").each(function(){
										if(
											!($($("#"+this.id).parent()).hasClass("invisible")) &&
											!($($("#"+this.id).parent()).hasClass("d-none")) &&
											this.id.indexOf("right") == -1
										){	
											var maneuver_name = this.id;
											change_button_state(maneuver_name,true);
											process_maneuver_button_change($("#"+maneuver_name)[0],ship_config);
											ship_config.update_maneuver_set();

											$("[data-talentforce-option]").each(function(){
												if(!($($("#"+this.id).parent()).hasClass("d-none"))){
													var talentforce_name = this.id;
													change_button_state(this.id,true);
													$("[data-sensor-option]").each(function(){
														if(!($($("#"+this.id).parent()).hasClass("d-none"))){
															var sensor_name = this.id;
															change_button_state(this.id,true);
															$("[data-tech-option]").each(function(){
																if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																	var tech_name = this.id;
																	change_button_state(this.id,true);
																	$("[data-configuration-option]").each(function(){
																		if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																			var configuration_name = this.id;
																			change_button_state(this.id,true);	
																			$("[data-title-option]").each(function(){
																				if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																					var title_name = this.id;
																					change_button_state(this.id,true);
																					$("[data-astromech-option]").each(function(){
																						if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																							var astromech_name = this.id;
																							change_button_state(this.id,true);		
																							$("[data-modification-option]").each(function(){
																								if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																									var modification_name = this.id;
																									change_button_state(this.id,true);


																									process_upgrade_buttons(ship_config);


																									change_button_state("show_range1",true);
																									change_button_state("show_range2",false);
																									change_button_state("show_range3",false);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1"+","+data_result.join());



																									change_button_state("show_range1",false);
																									change_button_state("show_range2",true);
																									change_button_state("show_range3",false);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R2"+","+data_result.join());


																									change_button_state("show_range1",false);
																									change_button_state("show_range2",false);
																									change_button_state("show_range3",true);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R3"+","+data_result.join());


																									change_button_state("show_range1",true);
																									change_button_state("show_range2",true);
																									change_button_state("show_range3",false);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1/2"+","+data_result.join());


																									change_button_state("show_range1",false);
																									change_button_state("show_range2",true);
																									change_button_state("show_range3",true);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R2/3"+","+data_result.join());


																									change_button_state("show_range1",true);
																									change_button_state("show_range2",true);
																									change_button_state("show_range3",true);
																									options = get_button_states("[data-display-option]");
																									data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																									console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1/2/3"+","+data_result.join());
																									
																								}
																							});
																							
																						}
																					});
																				}
																			});
																			
																		}
																	});
																}
															});
															
														}
													});

												}
											});
											//data-talentforce-option 
												//data-sensor-option
													//data-tech-option
														//data-configuration-option
															//data-title-option
																//data-astromech-option
																	//data-modification-option
											

											change_button_state(maneuver_name,false);
											process_maneuver_button_change($("#"+maneuver_name)[0],ship_config);
										}
									});
								}
							});
						}
					});
				}
			});
		} 
	});
	

	$( "#data-collect-ship-button" ).click(function() {
		if(DATA_COLLECTION_MODE){
			console.log("FACTION,SHIP,PILOT,MANEUVER,RANGE,RED,GREEN,BLUE");
			$("[data-pilot-option]").each(function(){
				if(!($($("#"+this.id).parent()).hasClass("d-none"))){
					process_pilot_change(this.id,ship_config);
					var pilot_name = (this.id.substring(0,3) == "no_") ? "Generic" : ship_config.pilot.pilot_name;
					$("[data-maneuver-option]").each(function(){
						if(
							!($($("#"+this.id).parent()).hasClass("invisible")) &&
							!($($("#"+this.id).parent()).hasClass("d-none")) &&
							this.id.indexOf("right") == -1
						){	
							var maneuver_name = this.id;
							change_button_state(maneuver_name,true);
							process_maneuver_button_change($("#"+maneuver_name)[0],ship_config);
							ship_config.update_maneuver_set();

							$("[data-talentforce-option]").each(function(){
								if(!($($("#"+this.id).parent()).hasClass("d-none"))){
									var talentforce_name = this.id;
									change_button_state(this.id,true);
									$("[data-sensor-option]").each(function(){
										if(!($($("#"+this.id).parent()).hasClass("d-none"))){
											var sensor_name = this.id;
											change_button_state(this.id,true);
											$("[data-tech-option]").each(function(){
												if(!($($("#"+this.id).parent()).hasClass("d-none"))){
													var tech_name = this.id;
													change_button_state(this.id,true);
													$("[data-configuration-option]").each(function(){
														if(!($($("#"+this.id).parent()).hasClass("d-none"))){
															var configuration_name = this.id;
															change_button_state(this.id,true);	
															$("[data-title-option]").each(function(){
																if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																	var title_name = this.id;
																	change_button_state(this.id,true);
																	$("[data-astromech-option]").each(function(){
																		if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																			var astromech_name = this.id;
																			change_button_state(this.id,true);		
																			$("[data-modification-option]").each(function(){
																				if(!($($("#"+this.id).parent()).hasClass("d-none"))){
																					var modification_name = this.id;
																					change_button_state(this.id,true);


																					process_upgrade_buttons(ship_config);


																					change_button_state("show_range1",true);
																					change_button_state("show_range2",false);
																					change_button_state("show_range3",false);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1"+","+data_result.join());



																					change_button_state("show_range1",false);
																					change_button_state("show_range2",true);
																					change_button_state("show_range3",false);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R2"+","+data_result.join());


																					change_button_state("show_range1",false);
																					change_button_state("show_range2",false);
																					change_button_state("show_range3",true);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R3"+","+data_result.join());


																					change_button_state("show_range1",true);
																					change_button_state("show_range2",true);
																					change_button_state("show_range3",false);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1/2"+","+data_result.join());


																					change_button_state("show_range1",false);
																					change_button_state("show_range2",true);
																					change_button_state("show_range3",true);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R2/3"+","+data_result.join());


																					change_button_state("show_range1",true);
																					change_button_state("show_range2",true);
																					change_button_state("show_range3",true);
																					options = get_button_states("[data-display-option]");
																					data_result = draw_everything(generate_shipstates(ship_config,options),options,c,DATA_COLLECTION_MODE);
																					console.log([ship_config.faction_name,ship_config.ship_name,pilot_name,maneuver_name,talentforce_name,sensor_name,tech_name,configuration_name,title_name,astromech_name,modification_name].join()+","+"R1/2/3"+","+data_result.join());
																					
																				}
																			});
																			
																		}
																	});
																}
															});
															
														}
													});
												}
											});
											
										}
									});

								}
							});
							//data-talentforce-option 
								//data-sensor-option
									//data-tech-option
										//data-configuration-option
											//data-title-option
												//data-astromech-option
													//data-modification-option
							

							change_button_state(maneuver_name,false);
							process_maneuver_button_change($("#"+maneuver_name)[0],ship_config);
						}
					});
				}
			});
		} 
	});


});