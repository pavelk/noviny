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

function pickedDate(value, date, inst) 
{ 
    if($("#article_publish_date").val().length == 0 )
    {
      $("#article_publish_date").val("20" + value.split("/").reverse().join("-") + ' 00:00:00');
    }else{
      $("#article_publish_date").val("20" + value.split("/").reverse().join("-") + $("#article_publish_date").val().substring(10,19));
    }   
}


function getCounter(formObj){
       var pos = formObj.position();
       $("#counter").css("top",pos.top);
       $("#counter").css("left",pos.left+formObj.width()+20);
       $("#counter").html("Pocet znaku:"+formObj.val().length);
       $("#counter").removeClass("hidden");
       $("#counter").addClass("visible");
       var min = formObj.attr('class').split(" ").pop().split("-")[1];
       var max = formObj.attr('class').split(" ").pop().split("-")[2];
       controlInput( formObj, min, max );
}


function hideCounter(){
       $("#counter").removeClass("visible");
       $("#counter").addClass("hidden");
}

function controlInput( obj, min, max )
{
  if(obj.val().length > max || obj.val().length < min)
  {
    obj.addClass('errorForm');
  }else{
    obj.removeClass('errorForm'); 
  }
  
}


//onload
$(function()
{
  var options = { 
      dataType: "script"
  };
  $("form").ajaxForm(options);
  
  //$("div[id^='group-'] h2").click(function() { navigationClick( $(this), null, $(this).parent().parent() ) });
  //$("#articles h2").click(function() { getArticles( $(this) ) });
  //$("#authors h2").click(function() { getAuthors( $(this) ) });
  $("#viewRecord").hide();
  
  //counter

  
});


function getAuthors( obj )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#authors .listFilter > *").remove();
    $("#authors .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
  
  $.ajax({
    type: 'GET',
    url: '/admin/authors',
    dataType: 'script',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("tr[id^='author_'] a.edit_author").bind("click", function() { return editAuthor( $(this))} );
      $("a[id^='authors_new']").bind("click", function() { return newAuthor()} );
    }
  });
  return false;
  }

}


function newAuthor()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/authors/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
  
}


function editAuthor( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/authors/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() });
      $("a[id^='file_']").bind("click", function() { return removeFileFromAuthor( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_file' ) });
      $("a[id^='img_']").bind("click", function() { return removeFileFromAuthor( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_img'  ) });
      //$("a[id^='file_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1] ) });      
    }
  });
  return false;

}

function getThemes( obj )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#themes .listFilter > *").remove();
    $("#themes .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
    
    $.ajax({
      type: 'GET',
      url: '/admin/themes',
      dataType: 'script',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        
      }
    });
    return false;  
  }
}

function getSections( obj )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#sections .listFilter > *").remove();
    $("#sections .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
    
    $.ajax({
      type: 'GET',
      url: '/admin/sections',
      dataType: 'script',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        
      }
    });
    return false;  
  }
}


function newSection()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/sections/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() });     
    }
  });
  return false;
  
}

function editSection( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/sections/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() });
    }
  });
  return false; 
  
}

function editTheme( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/themes/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });
    }
  });
  return false; 
  
}


function getArticles( obj )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#articles .listFilter > *").remove();
    $("#articles .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
  
  $.ajax({
    type: 'GET',
    url: '/admin/articles',
    dataType: 'script',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      //$("tr[id^='article_'] a.file").bind("click", function() { return showArticle( $(this))} );
      $("tr[id^='article_'] a.file").bind("click", function() { return editArticle( $(this))} );
      $("tr[id^='article_'] a.edit_article").bind("click", function() { return editArticle( $(this))} );
      $("a[id^='articles_new']").bind("click", function() { return newArticle()} );
      $(".pagination a").bind("click", function() {
        $(".pagination").html("");
        $("#articles tr").remove();
        //$.get(this.href, null, null, "script");
       // var params = $(this.href);
        //alert($(this.href.params[0]));
        $.ajax({
          type: 'GET',
          url: '/admin/articles',
          data: 'page=2',
          dataType: 'script',
          error: function(msg) { alert("Chyba v přenosu dat."); },
          success: function(data, status) {

          }
        });
        return false;
      });    
    }
  });
  
  return false;
  }  
}

function newArticle()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/articles/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      setCounterEvents();
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });
      $("#article_section_id").change(function()
      {


      });      
    }
  });
  return false;
  
}


function editArticle( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/articles/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      setCounterEvents();
      $("#article_section_id").change(function()
      {
          //handler pokud se budou menit subsections  
      });
      $(".recordHeader a").bind("click", function() { return cancelArticle() });
      $("a[id^='file_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_file' ) });
      $("a[id^='img_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_img'  ) });
      $("a[id^='audio_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_audio'  ) });      
    }
  });
  return false;

}


function setCounterEvents()
{
  $(".countable").focus(function() { getCounter( $(this) ) });
  $(".countable").keydown(function() { getCounter( $(this) )});
  $(".countable").blur(function() {hideCounter()});
  $("#viewRecord").scroll(function() {hideCounter()});
}

function loadSubsections( id )
{
  
}

function dragAndDrop()
{  
  //add picture / edit
  if($("form").attr("id").split("_")[0] == 'edit')
  {
    $(".dnd.imgr").droppable({
      accept: "div[id^='picture_']",
    	drop: function(ev, ui) {
    	  addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_img' );
    	  }
    });
    
    $(".dnd.filr").droppable({
      accept: "div[id^='inset_']",
    	drop: function(ev, ui) {
    	  addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_file' );
    	  }
    });
    
    $(".dnd.audr").droppable({
      accept: "div[id^='audio_']",
    	drop: function(ev, ui) {
    	  addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_audio' );
    	  }
    });
    
    
  }
  
  //add attachments - new action
  if($("form").attr("id").split("_")[0] == 'new')
  {
    //add picture / new
    $(".dnd.imgr").droppable({
      accept: "div[id^='picture_']",
    	drop: function(ev, ui) {
    	  var id = ui.draggable.attr("id").split("_")[1];
    	  $("div[class='addedFile forImgr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent())>Odstranit</a>"));
    	  $("fieldset").append("<input type='hidden' name='pictures[id_"+ id +"]' value='"+ id +"' id='newpict-"+ id +"'>");
    	}
    });
    
    //add file / new
    $(".dnd.filr").droppable({
      accept: "div[id^='inset_']",
    	drop: function(ev, ui) {
    	  var id = ui.draggable.attr("id").split("_")[1];
    	  $("div[class='addedFile forFilr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent())>Odstranit</a>"));
    	  $("fieldset").append("<input type='hidden' name='files[id_"+ id +"]' value='"+ id +"' id='newfils-"+ id +"'>");
    	}
    });
    
    //add audio / new
    $(".dnd.audr").droppable({
      accept: "div[id^='audio_']",
    	drop: function(ev, ui) {
    	  var id = ui.draggable.attr("id").split("_")[1];
    	  $("div[class='addedFile forAudr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent())>Odstranit</a>"));
    	  $("fieldset").append("<input type='hidden' name='audios[id_"+ id +"]' value='"+ id +"' id='newaud-"+ id +"'>");
    	}
    });
  
  
  }  
 
}

function removeElement(obj)
{
 obj.remove(); 
}

function addFileToArticle( controller, article, file, action )
{
  $.ajax({
     type: 'POST',
     url: '/admin/'+ controller  +'/'+ action +'/'+ article +'/'+ file,
     dataType: 'script',
     error: function(msg) { alert("Chyba v přenosu dat."); },
     success: function(data, status) {
       //alert(data.picture.data_file_name);from json      
     }
   });
   return false; 
}

function removeFileFromAuthor( article, file, action )
{
  $.ajax({
     type: 'POST',
     url: '/admin/authors/'+ action +'/'+ article +'/'+ file,
     dataType: 'script',
     error: function(msg) { alert("Chyba v přenosu dat."); },
     success: function(data, status) {      
     }
   });
   return false;
}

function removeFileFromArticle( article, file, action )
{
  $.ajax({
     type: 'POST',
     url: '/admin/articles/'+ action +'/'+ article +'/'+ file,
     dataType: 'script',
     error: function(msg) { alert("Chyba v přenosu dat."); },
     success: function(data, status) {      
     }
   });
   return false;
}

function cancelArticle()
{
  $("#viewRecord").hide();
  $("#recordHeader a").unbind();
  $("#listView").removeClass("listSmall");
}


function navigationClick( obj, id, type ) 
{
  //alert(type.attr("id"));
  if(obj.attr("class") == 'active')//mazani subvetvi
  {
    obj.removeClass('active');
    obj.addClass('folder');

    if( id != null )
    {
      var del = $(obj).parent().parent().attr("id");
      $("tr[id!='"+del+"'][id!='"+del+"_pict'][id^='"+del+"']").remove();
    }else{
      $("div[id^='group-"+type.attr("id").split("-")[1]+"'] .listFilter > *").remove();
      $("div[id^='group-"+type.attr("id").split("-")[1]+"'] .listContent > *").remove();
    }       
  }else{//pridavani
    obj.removeClass('folder');
    obj.addClass('active');
    if( id != null )
    {
      var ar = $(obj).parent().parent().attr("id").split("-");
      var tree = ar.slice(1, ar.length).join("-");
    }else{
      var tree = "";
    }  
    $.ajax({
      type: 'GET',
      url: '/admin/albums/get_level',
      data: 'id='+id+'&tree='+tree+'&type='+type.attr("id").split("-")[1],
      dataType: 'script',
      //beforeSend: function() { $("div[id^='group-"+type.attr("id").split("-")[1]+"'] h2").addClass("loading"); },
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        //$("div[id^='group-"+type.attr("id").split("-")[1]+"'] h2").removeClass("loading");
        $("div[id^='group-'] td.listItem a").bind("click", function() { return navigationClick( $(this), $(this).parent().attr("id"), $(this).parent().parent().parent().parent().parent().parent() ) });
        $("td a[class^='editLeaf-']").bind("click", function() { return editLeaf( $(this).attr("eid"), $(this).attr("class").split("-")[1]  ) });
        $("div[id^='picture_']").css("cursor: move;");
        $("div[id^='picture_']").draggable({
        	revert: 'invalid',
        	helper: 'clone',
        	cursor: 'move'
        });
        $("div[id^='inset_']").css("cursor: move;");
        $("div[id^='inset_']").draggable({
        	revert: 'invalid',
        	helper: 'clone',
        	cursor: 'move'
        });
        $("div[id^='audio_']").css("cursor: move;");
        $("div[id^='audio_']").draggable({
        	revert: 'invalid',
        	helper: 'clone',
        	cursor: 'move'
        });
        dragAndDrop(); 
      }
    });
    return false;
  }    
}

function editImage( id )
{
  
}

function newLeaf( type )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    data: 'type='+type,
    url: '/admin/albums/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function newAtt( type )
{
  var lnk = type;
  if (lnk == 'image') lnk = 'picture';
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/'+ lnk +'s/new', 
    data: 'type=' + type,
    //beforeSend: function() { $("#group1 h2").addClass("loading"); },
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      //$("#group1 h2").removeClass("loading");
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function editLeaf( id, type )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    url: '/admin/albums/'+id+'/edit',
    data: 'type='+type,
    dataType: 'script',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
    }
  });
  return false;
}

function cancelLeaf()
{
  $("#viewRecord").hide();
  $("#recordHeader a").unbind();
  $("td a.editLeaf").bind("click", function() { return editLeaf( $(this).attr("eid") ) });
  $("#listView").removeClass("listSmall");
}

/* show je shortcut pro edit - nebude vubec
function showArticle( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/articles/' + $(obj).parent().parent().attr("id").split("_")[1],
    beforeSend: function() { $("#articles h2").addClass("loading"); },
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("#articles h2").removeClass("loading");
      $(".recordHeader a").bind("click", function() { return cancelArticle() });      
    }
  });
  return false;
}
*/

/*
function remove_field(element, item) 
{
  element.up(item).remove();
}
*/
