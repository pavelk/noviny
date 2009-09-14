$(document).ready(function() {
  
  // search
  $("#search .button").click(function() {
    if($(this).val() == 'Co hledáte?') $(this).val('');
  }).blur(function() {
    if($(this).val() == '') $(this).val('Co hledáte?');
  });
  
  // gallery slider
  $(".gallery").serialScroll({
		target: '.thumbs',
	  items: 'li',
		prev: '.pages li.prev a',
		next: '.pages li.next a',
		offset: 0,
		start: 0,
		step: 6,
		duration: 800,
		force: true,
		stop: true,
		lock: false,
		cycle: false,
		navCounter: '.pages .actual'
	});
	
	// show big image from thumb
	$(".gallery .thumbs a").click(function() {
	  $(this).parents(".thumbs").find("li span").remove();
    $(this).parents(".gallery").find(".main img").attr("src", $(this).attr("href"));
    $(this).parents(".gallery").find(".main .info").text($(this).attr("title"));
    $(this).find("img").after("<span></span>");
    return false;
  });
  
  // share box
  $(".share").click(function() {
    var position = $(this).offset();
    $(".shareBox").remove();

    // structure
    $("body").append('<div class="shareBox"><div class="head"></div><div class="content"><div class="in"><h3 class="h">Share this on:</h3><ul><li class="facebook"><a href="">Facebook</a></li><li class="facebook"><a href="">Twitter</a></li><li class="facebook"><a href="">del.icio.us</a></li></ul><a href="#" class="close overlaid">Close<span></span></a></div></div><div class="bottom"></div></div>');
    
    // position
    $(".shareBox").css({ top: position.top - 20, left: (position.left + $(".shareBox").width()) });
    
    // close
    $(".shareBox .close").click(function() { $(".shareBox").remove(); return false; });
    return false;
  });
  
});