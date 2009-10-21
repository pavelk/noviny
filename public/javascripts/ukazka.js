$(document).ready(function () {	
	$("#navigation .primary a").click(function() { return getSubmenu($(this), 0, 'prev') });//vola na uplne prvni polozku Produkty
	$("#navigation .secondary a").click(function() { return naviClick($(this), 'prev') });
	$(".submenu a").click(function() { return naviClick($(this), 'next'); });
});

function naviClick(obj, dir) {
  var ar = new Array();
  ar = $(obj).parents("li").attr("id").split("_");
  var id = ar[1];
  //alert(id);
  
  return getSubmenu(obj, id, dir);
}

function makeFloor(obj, id, dir) {
  var text = $(obj).text();
  var link = $(obj).parents("ul").find(".last");
  
  if(dir == 'next') {
    $(link).removeClass("last");
    $(link).after('<li class="secondary last" id="menuId_'+id+'"><a href="">'+text+'</a><li>');
    $("#navigation li a").unbind();
    $("#navigation li a").bind("click", function() { return naviClick($(this), 'prev'); });
    $("#navigation li[class*='last'] a").bind("click", function() { return false; });
    //$("#navigation li.last").hide().fadeIn("slow");
    $("#navigation li.last").hide().fadeIn("slow");
  } else if(dir == 'prev') {
    var fadeid = $(obj).parents().attr("id");
    var lis = $("#navigation .secondary");
    var fade = false;
    
    if(fadeid == 'menuId_0') {
      $(lis).fadeOut().remove();
    } else {
      jQuery.each(lis, function(i, val) {
        //alert($(this).attr("id"));
        if(fade) $(this).fadeOut().remove();
        if($(this).attr("id") == fadeid) fade = true;
      });
    }
    
    $("#"+fadeid).addClass("last");
  }
}

function getSubmenu(clickedObj, parent, dir) {
  $.ajax({
    type: 'GET',
    url: 'ajax/ajax_getSubmenu.php',
    data: 'parent='+parent,
    beforeSend: function() { $(".submenu").addClass("loading"); },
    error: function(msg) { alert("AJAX error"); },
    success: function(results) {
      $(".submenu").removeClass("loading");
      if (results != '') {
        //alert(parent);
        makeFloor(clickedObj, parent, dir);
        $(".submenu").html(results).hide().fadeIn("slow");
      	$(".submenu a").bind("click", function() { return naviClick($(this), 'next'); });
		 	}
    }
  });
  return false;
}
