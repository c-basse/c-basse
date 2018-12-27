


var tiefighter = {
	faction: "empire",
	id: "tiefighter",
	basesize: smallbase,
	actions: ["roll"],
	move_sets: {
		roll_set: standard_roll_set,
		boost_set: standard_boost_set,
		decloack_set: standard_decloak_set,
		aileron_set: standard_boost_set,
		manuever_set: [
			{bearing:"turn",		speed: 1,direction: left,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"turn",		speed: 1,direction: right,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"turn",		speed: 2,direction: left,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"bank",		speed: 2,direction: left,	roll_direction: normal,slide: none,color: blue,enabled: false},
			{bearing:"straight",	speed: 2,direction: normal,	roll_direction: normal,slide: none,color: blue,enabled: false},
			{bearing:"bank",		speed: 2,direction: right,	roll_direction: normal,slide: none,color: blue,enabled: false},
			{bearing:"turn",		speed: 2,direction: right,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"turn",		speed: 3,direction: left,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"bank",		speed: 3,direction: left,	roll_direction: normal,slide: none,color: white,enabled: false},
			{bearing:"straight",	speed: 3,direction: normal,	roll_direction: normal,slide: none,color: blue,enabled: false},
			{bearing:"bank",		speed: 3,direction: right,	roll_direction: normal,slide: none,color: white,enabled: true},
			{bearing:"turn",		speed: 3,direction: right,	roll_direction: normal,slide: none,color: white,enabled: true},
			{bearing:"kturn",		speed: 3,direction: normal,	roll_direction: normal,slide: none,color: red,enabled: true},
			{bearing:"straight",	speed: 4,direction: normal,	roll_direction: normal,slide: none,color: white,enabled: true},
			{bearing:"kturn",		speed: 4,direction: normal,	roll_direction: normal,slide: none,color: red,enabled: true},
			{bearing:"straight",	speed: 5,direction: normal,	roll_direction: normal,slide: none,color: white,enabled: true}
		]
	},
};