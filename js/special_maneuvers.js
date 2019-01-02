const stressed_red_maneuver = {bearing:"straight",speed: 2,direction: NORMAL,roll_direction: NORMAL,slide: true,color: WHITE,enabled: true, draw_type: 1};
const standard_roll_set = {
		"roll-left": {bearing:"straight",speed: 1,direction: NORMAL,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"roll-right": {bearing:"straight",speed: 1,direction: NORMAL,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
	};
const microthrusters_roll_set = {
		"roll-leftbankleft": {bearing:"bank",speed: 1,direction: LEFT,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"roll-leftbankright": {bearing:"bank",speed: 1,direction: RIGHT,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"roll-rightbankleft": {bearing:"bank",speed: 1,direction: LEFT,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"roll-rightbankright": {bearing:"bank",speed: 1,direction: RIGHT,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
	};

const ig88d_sloop_set = {
		"3-ig88dright": {bearing:"ig88d",speed: 3,direction: RIGHT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0},
		"3-kturn": {bearing:"kturn",speed: 3,direction: LEFT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0},
		"3-ig88dleft": {bearing:"ig88d",speed: 3,direction: LEFT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0}
}

const ryad_kturn_set = {
		"2-ryadturn": {bearing:"kturn",speed: 2,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0},
		"3-ryadturn": {bearing:"kturn",speed: 3,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0},
		"4-ryadturn": {bearing:"kturn",speed: 4,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0},
		"5-ryadturn": {bearing:"kturn",speed: 5,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 0}
}

const kare_kun_boost_set = {
		"kare_kun_boost_left": {bearing:"turn",speed: 1,direction: LEFT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1},
		"kare_kun_boost_right": {bearing:"turn",speed: 1,direction: RIGHT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1}
}
const pivot_wing_set = {
		"left_pivot": {bearing:"rotate",speed: 90,direction: LEFT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0},
		"right_pivot": {bearing:"rotate",speed: 90,direction: RIGHT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0},
		"flip_pivot": {bearing:"rotate",speed: 180,direction: LEFT,roll_direction: NORMAL,slide: false,color: RED,enabled: true, draw_type: 0}
}
const standard_boost_set = {
		"boost-left": {bearing:"bank",speed: 1,direction: LEFT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1},
		"boost-mid": {bearing:"straight",speed: 1,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1},
		"boost-right": {bearing:"bank",speed: 1,direction: RIGHT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1}
	};
const standard_decloak_set = {
		"decloak-left": {bearing:"straight",speed: 2,direction: NORMAL,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-right": {bearing:"straight",speed: 2,direction: NORMAL,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-straight": {bearing:"straight",speed: 2,direction: NORMAL,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1}
	};

const echo_decloak_set = {
		"decloak-leftbankleft": {bearing:"bank",speed: 2,direction: LEFT,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-leftbankright": {bearing:"bank",speed: 2,direction: RIGHT,roll_direction: LEFT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-rightbankleft": {bearing:"bank",speed: 2,direction: LEFT,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-rightbankright": {bearing:"bank",speed: 2,direction: RIGHT,roll_direction: RIGHT,slide: true,color: WHITE,enabled: true, draw_type: 1},
		"decloak-straightbankleft": {bearing:"bank",speed: 2,direction: LEFT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1},
		"decloak-straightbankright": {bearing:"bank",speed: 2,direction: RIGHT,roll_direction: NORMAL,slide: false,color: WHITE,enabled: true, draw_type: 1}
	};