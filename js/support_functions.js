function translate_id_to_yasb_name(html_id){
		var yasb_name = html_id.replace(/__O__/g, "("); //open_parentheses
		yasb_name = yasb_name.replace(/__C__/g, ")"); //cloes_parentheses
		yasb_name = yasb_name.replace(/__Q__/g, '"'); //quotes
		yasb_name = yasb_name.replace(/__D__/g, '/'); //dash
		yasb_name = yasb_name.replace(/_/g, " ");
		return yasb_name;
}

function get_button_states(data_attribute_name){
	var state_object = {};
    $(data_attribute_name).each(function() {
	    // var button_element = $(this).children()[0]
	    state_object[this.id] = ($(this).is(":checked") || $($(this).parent()).hasClass("invisible")) ? true : false;
	});
  	return state_object;
}

function change_button_state(html_id,new_state){
	test = $("#"+html_id);
	test2 = $("#"+html_id).parent();
	if (new_state) {
  		$("#"+html_id).prop("checked",true);
  		$($("#"+html_id).parent()).addClass("active");
  	} else {
  		$("#"+html_id).prop("checked",false);
  		$($("#"+html_id).parent()).removeClass("active");
  	}
}

function get_selected_radio_option(data_attribute_name){
	return $("input[checked]"+data_attribute_name)[0].id;
}

function is_upgrade_valid(slot_name,upgrade_id,ship_config) {


	var check = 
	$.inArray(slot_name,ship_config.pilot.slots) !=-1 &&
	(!($("#"+upgrade_id).data("req-smallbase"))|| ship_config.basesize == SMALLBASE) &&
	(!($("#"+upgrade_id).data("req-mediumbase"))|| ship_config.basesize == MEDIUMBASE) &&
	(!($("#"+upgrade_id).data("req-largebase"))|| ship_config.basesize == LARGEBASE) &&
	(!($("#"+upgrade_id).data("req-boost"))|| $.inArray("Boost",ship_config.action_bar)>-1) &&
	(!($("#"+upgrade_id).data("req-roll"))|| $.inArray("Barrel Roll",ship_config.action_bar)>-1) &&
	(!($("#"+upgrade_id).data("req-redboost"))|| $.inArray("Boost",basicCardData().ships[ship_config.ship_name].actionsred)>-1) &&
	(!($("#"+upgrade_id).data("req-redroll"))|| $.inArray("Barrel Roll",basicCardData().ships[ship_config.ship_name].actionsred)>-1) &&
	(!($("#"+upgrade_id).data("req-rebel"))|| ship_config.faction_name == "Rebel Alliance") &&
	(!($("#"+upgrade_id).data("req-empire"))|| ship_config.faction_name == "Galactic Empire") &&
	(!($("#"+upgrade_id).data("req-scum"))|| ship_config.faction_name == "Scum and Villainy") &&
	(!($("#"+upgrade_id).data("req-resistance"))|| ship_config.faction_name == "Resistance") &&
	(!($("#"+upgrade_id).data("req-firstorder"))|| ship_config.faction_name == "First Order") &&
	((slot_name.toLowerCase() != "title" && slot_name.toLowerCase() != "configuration")|| $("#"+upgrade_id).data(ship_config.ship_id.toLowerCase()) );
	return check;
			
}

