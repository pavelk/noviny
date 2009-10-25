var defhei = 2; //číslice ve jménu předdefinované třídy (název třídy font_2)
var minhei = 1; //číslice ve jménu třídy s největším písmem
var maxhei = 3; //číslice ve jménu třídy s nejmenším písmem
var hei = defhei; //přednastavená hodnota
var loaded = false;
var bd = new Object();

switchFontSize = function(val) {
	nowheigh = hei;
	switch(val) {
		case 'inc':
			if (nowheigh < maxhei) {
				hei = nowheigh + 1;
		    for(var i = minhei; i <= maxhei; i++) $(bd).removeClass("font_" + i);
		    jQuery(bd).addClass("font_" + hei);
				createCookie('fxfont', hei, 30);
			}
		break;
		case 'dec':
			if (nowheigh > minhei) {
				hei = nowheigh - 1;
		    for(var i = minhei; i <= maxhei; i++) jQuery(bd).removeClass("font_" + i);
		    jQuery(bd).addClass("font_" + hei);
				createCookie('fxfont', hei, 30);
			}
		break;
	}
	setColorB(hei);
	loaded = true;
}

function setColorB(hei) {
	if (hei == defhei) {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	} else if (hei == maxhei) {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').addClass("disabled");
	} else if (hei == minhei) {
		jQuery('#fx-fontdecr').addClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	} else {
		jQuery('#fx-fontdecr').removeClass("disabled");
		jQuery('#fx-fontincr').removeClass("disabled");
	}
}

function createCookie(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+"; path=/";
}

function readCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) { 
      c_start = c_start + c_name.length + 1; 
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) c_end = document.cookie.length;
	    if ((document.cookie.substring(c_start,c_end) < minhei) || (document.cookie.substring(c_start,c_end) > maxhei)) return false;
	    return parseInt(unescape(document.cookie.substring(c_start, c_end))) ;
    } 
  }
  return false;
}

function setUserOptions() {
	if (!loaded) {
		cookie = readCookie("fxfont");
		hei = cookie ? cookie : defhei;
		
		bd = jQuery("#content");
		for(var i = minhei; i <= maxhei; i++) jQuery(bd).removeClass("font_" + i);
		
		jQuery(bd).addClass("font_" + hei);
		setColorB(hei);
		loaded = true;
	}
}