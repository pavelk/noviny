jQuery(document).ready(function() {
  
  // search
  jQuery("#search .button").click(function() {
    if(jQuery(this).val() == 'Co hledáte?') jQuery(this).val('');
  }).blur(function() {
    if(jQuery(this).val() == '') jQuery(this).val('Co hledáte?');
  });
  
  // gallery slider
  jQuery(".gallery").serialScroll({
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
	jQuery(".gallery .thumbs a").click(function() {
	  jQuery(this).parents(".thumbs").find("li span").remove();
    jQuery(this).parents(".gallery").find(".main img").attr("src", jQuery(this).attr("href"));
    jQuery(this).parents(".gallery").find(".main .info").text(jQuery(this).attr("title"));
	jQuery(this).parents(".gallery").find(".main img").attr("title", jQuery(this).attr("title"));
    jQuery(this).find("img").after("<span></span>");
    return false;
  });
  
  /*
  // share box
  jQuery(".share").click(function() {
    var position = jQuery(this).offset();
    jQuery(".shareBox").remove();

    // structure
    jQuery("body").append('<div class="shareBox"><div class="head"></div><div class="content"><div class="in"><h3 class="h">Share this on:</h3><ul><li class="facebook"><a href="">Facebook</a></li><li class="facebook"><a href="">Twitter</a></li><li class="facebook"><a href="">del.icio.us</a></li></ul><a href="#" class="close overlaid">Close<span></span></a></div></div><div class="bottom"></div></div>');
    
    // position
    jQuery(".shareBox").css({ top: position.top - 20, left: (position.left + jQuery(".shareBox").width()) });
    
    // close
    jQuery(".shareBox .close").click(function() { jQuery(".shareBox").remove(); return false; });
    return false;
  });*/
  
   // font resize
  setUserOptions();
  jQuery("#fx-fontdecr").click(function() {
    switchFontSize('dec');
    return false;
  });
  jQuery("#fx-fontincr").click(function() {
    switchFontSize('inc');
    return false;
  });
  
  // Cufon
  Cufon.replace("#logo")(".h")("h2.head"); 
  
  // overlays
  jQuery(".displayOverlay a").click(function() {
    var offset = jQuery(this).offset();    
    var clone = jQuery(this).parents(".displayOverlay").find(".overlay").clone();
    jQuery(".activeOverlay").remove();
    jQuery(clone).appendTo("#view").css({ top: offset.top, left: offset.left }).addClass("activeOverlay").show();
    return false;
  });
  
  // zruseni overlay
  jQuery("body").click(function(e) {
    var remove = true;
    if(document.all) e = event;
    if(e.target) source = e.target;
    else if(e.srcElement) source = e.srcElement;
    if(source.nodeType == 3) source = source.parentNode;
    
    if(jQuery(source).parents("div").hasClass("overlay")) remove = false;
    if(jQuery(source).hasClass("overlay")) remove = false;
    if(remove) jQuery(".activeOverlay").remove();
  });
});