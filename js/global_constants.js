const smallbase = 40;
const mediumbase = 60;
const largebase = 80;
const right = 1;
const left = -1;
const normal = 0;
const fwd = 1;
const bwd = -1;
const mid = 0;
const none = 99;
const white = 0;
const red = 1;
const blue = -1;
const slide_distance = 10;

const stressed_red_maneuver = {bearing:"straight",speed: 2,direction: normal,roll_direction: normal,slide: true,color: white,enabled: true};
const standard_roll_set = {
		"roll-left": {bearing:"straight",speed: 1,direction: normal,roll_direction: left,slide: true,color: white,enabled: true},
		"roll-right": {bearing:"straight",speed: 1,direction: normal,roll_direction: right,slide: true,color: white,enabled: true},
	};
const red_roll_set = {
		"roll-left": {bearing:"straight",speed: 1,direction: normal,roll_direction: left,slide: true,color: red,enabled: true},
		"roll-right": {bearing:"straight",speed: 1,direction: normal,roll_direction: right,slide: true,color: red,enabled: true},
	};
const standard_boost_set = {
		"boost-left": {bearing:"bank",speed: 1,direction: left,roll_direction: normal,slide: false,color: white,enabled: true},
		"boost-mid": {bearing:"straight",speed: 1,direction: normal,roll_direction: normal,slide: false,color: white,enabled: true},
		"boost-right": {bearing:"bank",speed: 1,direction: right,roll_direction: normal,slide: false,color: white,enabled: true}
	};
const red_boost_set = {
		"boost-left": {bearing:"bank",speed: 1,direction: left,roll_direction: normal,slide: false,color: red,enabled: true},
		"boost-mid": {bearing:"straight",speed: 1,direction: normal,roll_direction: normal,slide: false,color: red,enabled: true},
		"boost-right": {bearing:"bank",speed: 1,direction: right,roll_direction: normal,slide: false,color: red,enabled: true}
	};
const standard_decloak_set = {
		"decloak-left": {bearing:"straight",speed: 2,direction: normal,roll_direction: left,slide: true,color: white,enabled: true},
		"decloak-right": {bearing:"straight",speed: 2,direction: normal,roll_direction: right,slide: true,color: white,enabled: true},
		"decloak-straight": {bearing:"straight",speed: 2,direction: normal,roll_direction: normal,slide: true,color: white,enabled: true}
	};

//first_pilot is always generic
const PILOTS_SEED = {
'X-Wing':
	[{pilot_name: 'Red Squadron Veteran', slots: ['Force']}],
'K-Wing':
	[{pilot_name: 'Warden Squadron Pilot', slots: []}],
'E-Wing':
	[{pilot_name: 'Rogue Squadron Escort', slots: []}],
'Y-Wing':
	[{pilot_name: 'Gold Squadron Veteran', slots: []}],
'U-Wing':
	[{pilot_name: 'Saw Gerrera', slots: []}],
'YT-2400':
	[{pilot_name: 'Dash Rendar', slots: []}],
'YT-1300':
	[{pilot_name: 'Chewbacca', slots: []},
	{pilot_name: 'Lando Calrissian', slots: []}],
'HWK-290':
	[{pilot_name: 'Jan Ors', slots: []}],
'A-Wing':
	[{pilot_name: 'Green Squadron Pilot', slots: []}],
'Z-95 Headhunter':
	[{pilot_name: 'Tala Squadron Pilot', slots: []}],
'Auzituck Gunship':
	[{pilot_name: 'Lowhhrick', slots: []}],
'VCX-100':
	[{pilot_name: 'Kanan Jarrus', slots: []},
	{pilot_name: 'Hera Syndulla (VCX-100)', slots: []}],
'Attack Shuttle':
	[{pilot_name: 'Ezra Bridger', slots: []},
	{pilot_name: 'Sabine Wren', slots: []},
	{pilot_name: 'Hera Syndulla', slots: []}],
'Sheathipede-Class Shuttle':
	[{pilot_name: '"Zeb" Orrelios (Sheathipede)', slots: ['Force']}],
'B-Wing':
	[{pilot_name: 'Blade Squadron Veteran', slots: []}],
'ARC-170':
	[{pilot_name: 'Garven Dreis', slots: []}],
'Aggressor':
	[{pilot_name: 'IG-88A', slots: []},
	{pilot_name: 'IG-88D', slots: []}],
'Customized YT-1300':
	[{pilot_name: 'Han Solo (Scum)', slots: []}],
'Escape Craft':
	[{pilot_name: 'Lando Calrissian (Scum) (Escape Craft)', slots: []}],
'Fang Fighter':
	[{pilot_name: 'Skull Squadron Pilot', slots: []}],
'Firespray-31':
	[{pilot_name: 'Krassis Trelix', slots: []}],
'G-1A Starfighter':
	[{pilot_name: 'Zuckuss', slots: []}],
'JumpMaster 5000':
	[{pilot_name: 'Dengar', slots: []}],
'Kihraxz Fighter':
	[{pilot_name: 'Black Sun Ace', slots: []}],
'Lancer-Class Pursuit Craft':
	[{pilot_name: 'Ketsu Onyo', slots: ['Force']}],
'M12-L Kimogila Fighter':
	[{pilot_name: 'Cartel Executioner', slots: []}],
'M3-A Interceptor':
	[{pilot_name: 'Tansarii Point Veteran', slots: []}],
'Quadjumper':
	[{pilot_name: 'Constable Zuvio', slots: []}],
'Scurrg H-6 Bomber':
	[{pilot_name: 'Captain Nym', slots: []}],
'StarViper':
	[{pilot_name: 'Black Sun Assassin', slots: []}],
'YV-666':
	[{pilot_name: 'Bossk', slots: []}],
'Alpha-Class Star Wing':
	[{pilot_name: 'Rho Squadron Pilot', slots: []}],
'Lambda-Class Shuttle':
	[{pilot_name: 'Omicron Group Pilot', slots: []}],
'TIE Advanced Prototype':
	[{pilot_name: 'Baron of the Empire', slots: ['Force']}],
'TIE Advanced':
	[{pilot_name: 'Storm Squadron Ace', slots: []},
	{pilot_name: 'Darth Vader', slots: []}],
'TIE Interceptor':
	[{pilot_name: 'Soontir Fel', slots: []}],
'TIE Reaper':
	[{pilot_name: 'Major Vermeil', slots: []}],
'TIE Aggressor':
	[{pilot_name: 'Onyx Squadron Scout', slots: []}],
'TIE Punisher':
	[{pilot_name: 'Cutlass Squadron Pilot', slots: []}],
'TIE Defender':
	[{pilot_name: 'Onyx Squadron Ace', slots: []},
	{pilot_name: 'Countess Ryad', slots: []}],
'TIE Phantom':
	[{pilot_name: 'Sigma Squadron Ace', slots: []},
	{pilot_name: '"Echo"', slots: []}],
'TIE Bomber':
	[{pilot_name: 'Gamma Squadron Ace', slots: []}],
'TIE Striker':
	[{pilot_name: 'Black Squadron Scout', slots: []},
	{pilot_name: '"Duchess"', slots: []}],
'VT-49 Decimator':
	[{pilot_name: 'Captain Oicunn', slots: []}],
'TIE Fighter':
	[{pilot_name: 'Black Squadron Ace', slots: []},
	{pilot_name: 'Sabine Wren (TIE Fighter)', slots: []}],
'T-70 X-Wing':
	[{pilot_name: 'Black Squadron Ace (T-70)', slots: []},
	{pilot_name: 'Poe Dameron', slots: []},
	{pilot_name: 'Nien Numb', slots: []}],
'TIE/FO Fighter':
	[{pilot_name: '"Midnight"', slots: []}],
'TIE/VN Silencer':
	[{pilot_name: 'First Order Test Pilot', slots: ['Force']}],
'Upsilon-Class Shuttle':
	[{pilot_name: 'Lieutenant Dormitz', slots: []}],
'RZ-2 A-Wing':
	[{pilot_name: 'Tallissan Lintra', slots: []}],
'TIE/SF Fighter':
	[{pilot_name: '"Backdraft"', slots: []}],
'Scavenged YT-1300':
	[{pilot_name: 'Chewbacca (Resistance)', slots: ['Force']}],
'Mining Guild TIE Fighter':
	[{pilot_name: 'Mining Guild Surveyor', slots: []}],
'MG-100 StarFortress': [{pilot_name: 'Vennie', slots: []}]
};