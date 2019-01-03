function update_css_for_viewport_size(){

    var right_of_fixed = $('#layer0').width() + 10;
  	var bottom_of_fixed = $('#fixed_canvas_container').position().top + $('#fixed_canvas_container').height();

    $('#fixed_canvas_container').addClass("fixed_canvas");
    $('#pure-toggle-left').addClass("fixed_canvas");
	
	if($( window ).width() > right_of_fixed+378){
      $('#scrollable_buttons_area').css('margin-left',right_of_fixed);
      $('#scrollable_buttons_area').css('margin-top',"0px");

  } else {
      var left_side = ($( window ).width()>384) ? (($( window ).width()-384)/2).toString() + "px" : "0px";
  	  if($( window ).height()-bottom_of_fixed < 285){
        $('#fixed_canvas_container').removeClass("fixed_canvas");
        $('#pure-toggle-left').removeClass("fixed_canvas");
        $('#scrollable_buttons_area').css('margin-top',"0px");
        $('#scrollable_buttons_area').css('margin-left',left_side);
      } else {
        $('#scrollable_buttons_area').css('margin-top',bottom_of_fixed);
        $('#scrollable_buttons_area').css('margin-left',left_side);

      }
      
      
  }
}

function toggle_hd(enable_hd){
  if(enable_hd){
    $("#layer0").attr("width","1856");
    $("#layer0").attr("height","1392");

  }else{
    $("#layer0").attr("width","1024");
    $("#layer0").attr("height","768");
  }

}