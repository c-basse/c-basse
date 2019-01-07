const DATA_COLLECTION_MODE = false;
const SMALLBASE = 40;
const MEDIUMBASE = 60;
const LARGEBASE = 80;
const RIGHT = 1;
const LEFT = -1;
const NORMAL = 0;
const REAR = 2;
const FWD = 1;
const BWD = -1;
const MID = 0;
const NONE = 99;
const WHITE = 0;
const RED = 1;
const BLUE = -1;
const SLIDE_DISTANCE = 10;
const EDGE_LENGTH = edge_length_procedural();
const ARC_ANGLE = arc_angle_procedural();
const BASE_INTERSECT = base_intersect_procedural();

function edge_length_procedural(){
	var edge_length = {};

	edge_length[SMALLBASE] = {};
	edge_length[MEDIUMBASE] = {};
	edge_length[LARGEBASE] = {};

	for (var basesize in edge_length) {
		edge_length[basesize].short = ((basesize-60)/1000+0.88)*basesize;
		edge_length[basesize].long = parseInt(basesize,10);
	}

	return edge_length;
}

function arc_angle_procedural() {	
	var arc_angle = {};
	for (var range = 1; range <= 3; range++) {
		arc_angle[range] = {};
		for (var basesize in EDGE_LENGTH) {
			arc_angle[range][basesize] = {}
			arc_angle[range][basesize].short =
				Math.PI-
				(Math.PI - Math.atan(EDGE_LENGTH[basesize].short/EDGE_LENGTH[basesize].long))-
				Math.asin(
					(EDGE_LENGTH[basesize].short-EDGE_LENGTH[basesize].short)
					/2
					/EDGE_LENGTH[basesize].short
					*EDGE_LENGTH[basesize].short
					/(100*range)
					*Math.sin(Math.PI - Math.atan(EDGE_LENGTH[basesize].short/EDGE_LENGTH[basesize].short))
				);
			arc_angle[range][basesize].long = Math.PI/2-arc_angle[range][basesize].short;
		}
	}
	return arc_angle;
}

function base_intersect_procedural() {
	var base_intersect = {};
	for (var basesize in EDGE_LENGTH) {
		base_intersect[basesize] = {};
		base_intersect[basesize].short = {
			x: EDGE_LENGTH[basesize].short/2,
			y: 0
		};
		base_intersect[basesize].long = {
			x: basesize/2,
			y: basesize/2-EDGE_LENGTH[basesize].short/2
		};
	}
	return base_intersect;
}
