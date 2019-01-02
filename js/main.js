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
    $(window).on('resize', function(){
    	update_css_for_viewport_size();      
	});

    update_css_for_viewport_size();    

	process_faction_change(get_selected_radio_option("[data-faction-option]"),ship_config);
	options = get_button_states("[data-display-option]");
	draw_everything(generate_shipstates(ship_config,options),options,c);

	$("[data-display-option]").change(function(){
		options = get_button_states("[data-display-option]");
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$("[data-faction-option]").change(function(){
		test = this;
		process_faction_change(this.id,ship_config);
		draw_everything(generate_shipstates(ship_config,options),options,c);
	});

	$("[data-ship-option]").change(function(){
		process_ship_change(this.id,ship_config);
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
});