var reconstructHistory = new Array();
//$.history.push("#group1 h2");

// kazdy request se spravnym headerem
jQuery.ajaxSetup({ 
  'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")}
})

// pridavam .js mime k URL pro korektni rails respond_to response
var mimeifyUrl = function(url){
	if (/\.js/.test(url)){
		return url
	} else if (/\?/.test(url)) {
		return url.replace('?', '.js?')
	} else {
		return url + '.js'
	}
}




$(function()
{
  var options = { 
      dataType: "script"
  };
  $("form").ajaxForm(options);
  
  $("#group1 h2").click(function() { navigationClick( $(this), null ) });
  $("#viewRecord").hide();
  
  //$.history.push($("#group1 h2"));
  //reconstructTree();
  //$.history = "#group1 h2";
  //$("#idgroup1 h2.active").click(function() { deleteTree( $(this) ) });
});

function reconstructTree()
{
  //alert($.history[0]);
  //$.h[0].remove();
}

function navigationClick( obj, id ) 
{
  //$.h.push(obj);
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    //var del = 
    //alert
    //alert("a ."+id);
    //$("tbody[id=del_"+id+"]").hide();
   // alert($("tbody[id=del_"+id+"]").children());
    //$("tbody[id=del_"+id+"]").children().remove();    
  }else{
    reconstructHistory.push( obj );
    obj.removeClass('folder');
    obj.addClass('active');
    if( id != null )
    {
      var ar = $(obj).parent().parent().attr("id").split("-");
      var tree = ar.slice(2,ar.length).join("-");
    }else{
      //zbavit se group1
      var tree = "";
    }  
    $.ajax({
      type: 'GET',
      url: '/admin/albums/get_level',
      data: 'id='+id+'&tree='+tree,
      dataType: 'script',
      beforeSend: function() { $("#group1 h2").addClass("loading"); },
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        $("#group1 h2").removeClass("loading");
        //$("td.listItem a").bind("click", function() { return navigationClick( $(this).parent(), $(this).parent().attr("id") ) });
        $("td.listItem a").bind("click", function() { return navigationClick( $(this), $(this).parent().attr("id") ) });
        $("td a.editLeaf").bind("click", function() { return editLeaf( $(this).attr("eid") ) });
      }
    });
    return false;
  }    
}

function editImage( id )
{
  alert(id);
}

function newLeaf()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/albums/new',
    //url: '/admin/pictures/new',
    beforeSend: function() { $("#group1 h2").addClass("loading"); },
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("#group1 h2").removeClass("loading");
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function newAtt()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/pictures/new',
    beforeSend: function() { $("#group1 h2").addClass("loading"); },
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("#group1 h2").removeClass("loading");
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function editLeaf( id )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    url: '/admin/albums/'+id+'/edit',
    dataType: 'script',
    beforeSend: function() { $("#group1 h2").addClass("loading"); },
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("#group1 h2").removeClass("loading");
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function cancelLeaf()
{
  //reconstructTree();
  $("#viewRecord").hide();
  $("#recordHeader a").unbind();
  $("td a.editLeaf").bind("click", function() { return editLeaf( $(this).attr("eid") ) });
  $("#listView").removeClass("listSmall");
}

function deleteTree( obj )
{
  alert("vymaz");
  
}

/*
function remove_field(element, item) 
{
  element.up(item).remove();
}
*/
