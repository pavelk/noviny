// all requests with valid header
jQuery.ajaxSetup({ 
  'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")}
})

//global vars
var relarticles = new Array();
var thickbox_id = 0;


function checkBoxes()
{
  $("div[id='TB_ajaxContent'] input[type='checkbox']").each(function (i) {  
    if(relarticles.findItem($(this).val()))
    {
      $(this).attr('checked', true);
    }
  });  
}

//onload
$(function()
{
	$("#video-visible").livequery(function() {
	    $(this).hide();
	 });
	
	//alert($("#TB_ajaxContent").html());
	//$("#TB_ajaxContent").html('pokus')

	//attachments live draggable actions
  $("div[id^='picture_'], div[id^='inset_'], div[id^='audio_'],  tr[id^='infobox_']").livequery(function() {
    $(this).draggable({
    	revert: 'invalid',
    	helper: 'clone',
    	cursor: 'move'
    });
  });
  
  //droppable actions for all new & edit forms
  $("form[id^='edit_'], form[id^='new_']").livequery(function() {
    dragAndDrop();
  });
  
  //ajax form for all forms
  $("form").livequery(function() {
    $(this).ajaxForm(
    {
    	dataType: 'script',
    	beforeSend: function(xhr) {xhr.setRequestHeader("Accept", "text/javascript");},
    	resetForm: true,
    	complete: function(XMLHttpRequest, textStatus) { 
    	}
    }
    );
  });  
    
  $("#viewRecord").hide();
  	
  $("input[class='hideSearch']").livequery(function() {
    $(this).hide();
  });
  
  $("input[class='showSearch']").livequery(function() {
    $(this).show();
  });
  
  $("a[class='thickbox']").livequery(function() {
    tb_init('a.thickbox');
  });
  
  $("a[class='thickbox_main']").livequery(function() {
    tb_init('a.thickbox_main');
  });
  
  $("a[class='thickbox_sidebar']").livequery(function() {
    tb_init('a.thickbox_sidebar');
  });
  
  $("a[class='thickbox_article']").livequery(function() {
    tb_init('a.thickbox_article');
  });
  
  $("a[class='thickbox_themes']").livequery(function() {
    tb_init('a.thickbox_themes');
  });
 
  $("a[class='thickbox_question']").livequery(function() {
    tb_init('a.thickbox_question');
  });
 
  
  $("div[id='TB_ajaxContent'] input[type='checkbox']").livequery(function() {
    $(this).change(function() {
      related_id = "related";
      if (thickbox_id != 0) related_id = "related_"+ thickbox_id;

      if($(this).attr('checked'))
      {
        $("div[id='"+related_id+"']").append("<input type='hidden' name='"+related_id+"[id_"+ $(this).val() +"]' value='"+ $(this).val() +"' id='"+related_id+"-"+ $(this).val() +"'>");
        relarticles.push($(this).val());
      }else{
        $("input[id='"+related_id+"-"+ $(this).val() +"']").remove();
        relarticles.removeItem($(this).val());
      }
    });    
  });
  
  //add - remove section checkboxes
  $("div[id^='checkbox-'] input").livequery(function() {
    $(this).change(function() {
       if($(this).attr('checked'))
       {
         $.ajax({
           type: 'GET',
           dataType: 'script',
           url: '/admin/sections/get_subsection/' + $(this).parent().attr('id').split('-')[2] + '/' + $(this).parent().attr('id').split('-')[1] + '/' + $(this).parent().attr('id').split('-')[3],
           error: function(msg) { alert("Chyba v přenosu dat."); },
           success: function(data, status) {          
           }
         });
       }else{
         $("div[id='subsection-"+ $(this).parent().attr('id').split('-')[2]  +"']").remove();
       }      
    });  
  });  
  
  //date input field
  $("input[id$='publish_date'], input[id$='date_start'], input[id$='date_end']").livequery(function() {
     $.datepick.setDefaults({dateFormat: 'dd/mm/yy'});
     $(this).datepick({defaultDate: null});
  });
  
  //time input field
  $("input[id$='publish_time']").livequery(function() {
   $(this).timeEntry({show24Hours: true })
  });
  
  //wysiwyg
  $("#article_text").livequery(function() {
   $(this).simpleditor({
    imageButton: "linkedImages",
        css: "/css/simpleEditor.View.css"
      });
  });

  $("#text_page_text").livequery(function() {
   $(this).simpleditor({
    imageButton: "linkedImages",
        css: "/css/simpleEditor.View.css"
      });
  });
  
  //linked images edit actions
  $("a[id^='ajaxImage-']").livequery(function() {
    $("input[id='linkedImages']").attr({ value: $("input[id='linkedImages']").attr("value") + $(this).attr('id').split('-')[4] + "-" });
  });
  
  $("a[id^='img_']").livequery(function() {
    $("input[id='linkedImages']").attr({ value: $("input[id='linkedImages']").attr("value") + $(this).attr('id').split('_')[1] + "-" });
  });
  
  //remove already associated assets
  $("a[id^='ajaxImage']").livequery('click', function(event) {
    return tmpremoveFileFromArticle( $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[3], $(this).attr("id").split("-")[4], 'remove_image' )
  });
  
  $("a[id^='ajaxBox']").livequery('click', function(event) { 
    return tmpremoveFileFromArticle( $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[3], $(this).attr("id").split("-")[4], 'remove_box' ) 
  });
  
  $("a[id^='ajaxFile']").livequery('click', function(event) { 
    return tmpremoveFileFromArticle( $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[3], $(this).attr("id").split("-")[4], 'remove_file' ) 
  });
  
  $("a[id^='ajaxAudio']").livequery('click', function(event) { 
    return tmpremoveFileFromArticle( $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[3], $(this).attr("id").split("-")[4], 'remove_audio' ) 
  });
  
  //counter events
  $("form[id^='edit_article'], form[id^='new_article'] ").livequery(function() {
    setCounterEvents();
  });

  //update wysiwyg on submit
  $("input[type='submit']").livequery('click', function(event) {
	$("#article_text, #text_page_text").simpleditor("updateTextArea");
  });
  
});

function insertEditor( path, sourcePath, width, height )
{
      //alert(path + ', ' + sourcePath);
	  var flashvars = {};
      flashvars.input_image = sourcePath;
      flashvars.target_width = width;
      flashvars.target_height = height;
	  if($("input[id='fid']").length > 0)
	  {
		flashvars.target_url = "/admin/" + path + "/add_flash_image/?fid=" + $("input[id='fid']").val();
		//flashvars.target_url = "/admin/" + path + "/add_flash_image";
	  }else if($("input[id='flashimage_id']").length > 0){
		flashvars.target_url = "/admin/" + path + "/add_flash_image/?fnid=" + $("input[id='flashimage_id']").val();
	  }else{
		flashvars.target_url = "/admin/" + path + "/add_flash_image";
	  }	
      
      flashvars.exit_function = "closeEditor";
	  flashvars.save_function = "saveEditor";	
      var params = {};
      params.menu = "false";
      params.scale = "noscale";
	  params.align = "tl";
      params.allowscriptaccess = "always";
      var attributes = {};
      swfobject.embedSWF("/images/main.swf", "flashDiv", width + 100, height + 100, "9.0.24", "/images/expressInstall.swf", flashvars, params, attributes);
}

function saveEditor(val)
{
	alert('Fotka byla ulozena');
	if(parseInt(val) > 0)
	{
		$("#flashImageHidden").html("<input type='hidden' id='flashimage_id' name='flashimage_id' value='"+val+"'>");
	}	
}

function closeEditor()
{
	$("#flashDiv").hide();
}

//delete all records
function deleteRecord(obj, controller, model)
{
	if(confirm('Opravdu smazat?'))
	{
		$.ajax({
	        url: '/admin/'+ controller +'/' + $(obj).parent().parent().attr("id").split("_")[1] + '/?class=' + model,
	        type: 'post',
	        dataType: 'script',
	        data: { '_method': 'delete' },
	        success: function() {
				$(obj).parent().parent().remove();
	        }
	    });
	}
	return false;	
}

function verify_form()
{
	return confirm('submitnout?');
}

function deleteAssets(dom, obj, controller, model)
{
	if(confirm('Opravdu smazat?'))
	{
		$.ajax({
	        url: '/admin/'+ controller +'/' + obj + '/?class=' + model,
	        type: 'post',
	        dataType: 'script',
	        data: { '_method': 'delete' },
	        success: function() {
				$(dom).parent().remove();
	        }
	    });
	}
	return false;	
}

//get records for all modules without assets
function getRecords( statObj, paging )
{
  var controller = statObj.parent().parent().attr('id');
  if(statObj.attr("class") == 'active')
  {
    statObj.removeClass('active');
    statObj.addClass('folder');
    $("#" + controller + " .listFilter > *").remove();
    $("#" + controller + " .listContent > *").remove();
  }else{
    statObj.removeClass('folder');
    statObj.addClass('active');

    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: '/admin/' + controller,
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        if( paging == 'yes' )
        {
          $("div[id='" + controller + "'] .pagination a").live("click", function() {      
          $("#" + controller + " .listFilter > *").remove();
          $("#" + controller + " .listContent > *").remove();
          $.get(this.href, null, function(data){}, "script");
            return false;
          });
        }                
      }
    });
    return false;
  }
}

//new record for all modules without assets
function newRecord( controller )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/' + controller + '/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });//livequery?     
    }
  });
  return false;  
}

//edit record for all modules without assets
function editRecord( obj, controller )
{
  $("#listView").addClass("listSmall");
    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: '/admin/'+ controller +'/' + $(obj).attr("id").split("_")[1] + "/edit",
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
      }
    });
    return false;  
}

//linked images to Thickbox for Wysiwyg
function addImagesToTBBox(imgIds)
{
  var imgs = imgIds.split("-");
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/pictures/get_linked_imgs', 
    data: "imgs=" + imgs.slice(0,imgs.length - 1),
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      //alert(status);
    }
  });
  $('#TB_window').die("unload",addImagesToTBBox);
  return false;
}

/** ARTICLES **/
// date picker
/*
function pickedDate( value, date, inst ) 
{ 
    if($("#article_publish_date").val().length == 0 )
    {
      $("#article_publish_date").val(value.split("/").reverse().join("-") + ' 00:00:00');
    }else{
      $("#article_publish_date").val(value.split("/").reverse().join("-") + $("#article_publish_date").val().substring(10,19));
    }   
}
*/

function editAttachment(obj)
{
 $("#listView").addClass("listSmall");
 $.ajax({
   type: 'GET',
   dataType: 'script',
   data: 'type=' + $(obj).attr("id").split("-")[3],
   url: '/admin/'+ $(obj).attr("id").split("-")[1] + '/'+ $(obj).attr("id").split("-")[2] +'/edit', 
   error: function(msg) { alert("Chyba v přenosu dat."); },
   success: function(data, status) {
     $(".recordHeader a").bind("click", function() { return cancelLeaf() });      
   }
 });
  return false;
}

// word counter
function getCounter( formObj ){
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

// check min/max lengt
function controlInput( obj, min, max )
{
  if(obj.val().length > max || obj.val().length < min)
  {
    obj.addClass('errorForm');
  }else{
    obj.removeClass('errorForm'); 
  }  
}

function setCounterEvents()
{
  $(".countable").focus(function() { getCounter( $(this) ) });
  $(".countable").keydown(function() { getCounter( $(this) )});
  $(".countable").blur(function() {hideCounter()});
  $("#viewRecord").scroll(function() {hideCounter()});
}

function removeRelationship( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/relationships/remove_rel/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}

function getRelationship(tb_id)
{
  //alert(tb_id);
  if (tb_id != null) thickbox_id = tb_id;
  if (relarticles.length > 0) relarticles.splice(0,relarticles.length);

  $('#TB_window').live("unload",getRelatedAfterSave);
  $.ajax({
    type: 'GET',
    dataType: 'script',
    //if($("a[id^='relart_']").attr("id").split("_")[1].length() == 0)
    //{
      url: '/admin/relationships/',
    //}else{
      //url: '/admin/relationships/?id=' + $("a[id^='relart_']").attr("id").split("_")[1],
    //}    
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("div[id='TB_ajaxContent'] .pagination a").live("click", function() {
      $("#TB_ajaxContent > *").remove();
      $.get(this.href, null, function ( data ){
        //$("input[id='cancelSearchRelationships']").hide(); 
	  }, "script");
    return false;
  });
    }
  });
  return false;
}

function getRelatedAfterSave(){
  if($("input[id^='related_"+ thickbox_id +"']").length > 0 )
  {
  switch(thickbox_id){
      case 'sidebar':
      //case 'main':
      	$.ajax({
          type: 'POST',
          dataType: 'script',
          url: '/admin/articles/get_relarticles', 
          data: $("input[id^='related_"+ thickbox_id +"']").serialize(),
          error: function(msg) { alert("Chyba v přenosu dat."); },
          success: function(data, status) {
            //$("div[id^='related_sidebar']").append(data);
            //alert('ahoj');
            	thickbox_id = "";
          }
        });

        break;
      case 'question':
      	$.ajax({
          type: 'POST',
          dataType: 'script',
          url: '/admin/dailyquestions/get_reldailyquestions', 
          data: $("input[id^='related_"+ thickbox_id +"']").serialize(),
          error: function(msg) { alert("Chyba v přenosu dat."); },
          success: function(data, status) {
            //$("div[id^='related_sidebar']").append(data);
            //alert('ahoj');
            	thickbox_id = "";
          }
        });
        break;
      case 'themes':
        //alert('todo fill related themes');
        $.ajax({
          type: 'POST',
          dataType: 'script',
          url: '/admin/themes/get_relthemes', 
          data: $("input[id^='related_themes']").serialize(),
          error: function(msg) { alert("Chyba v přenosu dat."); },
          success: function(data, status) {
            //$("div[id^='related_themes']").append(data);
            	thickbox_id = "";
          }
        });
        break;
      default:
        break;
  }
	$('#TB_window').die("unload",getRelatedAfterSave);
  }
	return false;  	
}

function getRelationthemeship(tb_id)
{
  if (tb_id != null) thickbox_id = tb_id;
  if (relarticles.length > 0) relarticles.splice(0,relarticles.length);
  $('#TB_window').live("unload",getRelatedAfterSave);
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/relationthemeships/',   
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("div[id='TB_ajaxContent'] .pagination a").live("click", function() {
      $("#TB_ajaxContent > *").remove();
      $.get(this.href, null, function ( data ){ 
	  }, "script");
    return false;
  });
    }
  });
  return false;
}

function removeRelationthemeship( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/relationthemeships/remove_rel/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}

function getRelationquestionship(tb_id)
{
  if (tb_id != null) thickbox_id = tb_id;
  if (relarticles.length > 0) relarticles.splice(0,relarticles.length);
  $('#TB_window').live("unload",getRelatedAfterSave);
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/relationquestionships/',   
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $("div[id='TB_ajaxContent'] .pagination a").live("click", function() {
      $("#TB_ajaxContent > *").remove();
      $.get(this.href, null, function ( data ){ 
	  }, "script");
    return false;
  });
    }
  });
  return false;
}

function removeRelationquestionship( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/relationquestionships/remove_rel/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}

function removeTagSelection( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/tag_selections/remove_rel/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
  
}

function removeHeadlinerArticle( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/headliner_boxes/remove_rel/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}

function removeHeadlinerTheme( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/headliner_boxes/remove_reltheme/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}

function removeHeadlinerDailyquestion( obj )
{
  $.ajax({
    type: 'POST',
    dataType: 'script',
    url: '/admin/headliner_boxes/remove_relquestion/' + $(obj).attr("id").split("_")[1] + '/' + $(obj).attr("id").split("_")[2],
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      removeElement($(obj).parent());
    }
  });
  return false;
}
function revertVersion( version, article )
{
  $.ajax({
  type: 'POST',
  dataType: 'script',
  url: '/admin/articles/revert_version/' + article + "/" + version,
  error: function(msg) { alert("Chyba v přenosu dat."); },
  success: function(data, status) {
  	    
    }
  });
  return false;
}

function getVersion( version, article )
{
  $.ajax({
  type: 'POST',
  dataType: 'script',
  url: '/admin/articles/get_version/' + article + "/" + version,
  error: function(msg) { alert("Chyba v přenosu dat."); },
  success: function(data, status) {
  	    
    }
  });
  return false;
}

function getVersions( article )
{
  $("#listView").addClass("listSmall");
  $.ajax({
  type: 'GET',
  dataType: 'script',
  url: '/admin/articles/get_versions/' + article,
  error: function(msg) { alert("Chyba v přenosu dat."); },
  success: function(data, status) {
  	 $(".recordHeader a").bind("click", function() { return cancelArticle() });   
    }
  });
  return false;
}

function addFlashTool(path)
{
	if(path == 'articles')
	{
		var sourcePath = $("div[class='addedFile forImgrV'] img").attr('src').replace('small', 'original');
	}else{
		var sourcePath = $("div[class='addedFile forImgr'] img").attr('src').replace('small', 'original');
	}
	if(path == 'headliner_boxes')
	{
	  insertEditor( path, sourcePath, 440, 255 );
	  $('#flashDiv').css('width:540px;height:355px');		
	}else{
	  insertEditor( path, sourcePath, 140, 90 );
	  $('#flashDiv').css('width:240px;height:190px');	
	}

}

function dragAndDrop()
{  

  $(".dnd.imgrs.headliner").droppable({
    accept: "div[id^='picture_']",
  	drop: function(ev, ui) {
  	  var id = ui.draggable.attr("id").split("_")[1];
  	  $("div[class='addedFile forImgr'] > *").remove();
  	  $("div[id='headliner_box_picture_id'] > *").remove();
  	  $("div[class='addedFile forImgr']").append(ui.draggable.clone());
  	  $("fieldset").append("<input type='hidden' id='headliner_box_picture_id' name='headliner_box[picture_id]' value='"+ id +"'>");
	  $("#flashImageLink").html("<br/><a href='#' onclick='addFlashTool(\"headliner_boxes\"); return false'>Upravit orezani obrazku</a>");
  	}
  });
  
  $(".dnd.imgrs.banner").droppable({
    accept: "div[id^='picture_']",
  	drop: function(ev, ui) {
  	  var id = ui.draggable.attr("id").split("_")[1];
  	  $("div[class='addedFile forImgr'] > *").remove();
  	  $("div[id='article_banner_picture_id'] > *").remove();
  	  $("div[class='addedFile forImgr']").append(ui.draggable.clone());
  	  $("fieldset").append("<input type='hidden' id='article_banner_picture_id' name='article_banner[picture_id]' value='"+ id +"'>");
	  $("#flashImageLink").html("<br/><a href='#' onclick='addFlashTool(\"article_banners\"); return false'>Upravit orezani obrazku</a>");	
	}
  });

  $(".dnd.imgrs.article").droppable({
    accept: "div[id^='picture_']",
  	drop: function(ev, ui) {
  	  var id = ui.draggable.attr("id").split("_")[1];
  	  $("div[class='addedFile forImgrV'] > *").remove();
  	  $("div[id='article_picture_id'] > *").remove();
  	  $("div[class='addedFile forImgrV']").append(ui.draggable.clone());
  	  $("fieldset").append("<input type='hidden' id='article_picture_id' name='article[picture_id]' value='"+ id +"'>");
	  $("#flashImageLink").html("<br/><a href='#' onclick='addFlashTool(\"articles\"); return false'>Upravit orezani obrazku</a>");	
	}
  });
  

	//add attachments / edit
  if($("form").attr("id").split("_")[0] == 'edit')
  {
    $(".dnd.imgr").droppable({
      accept: "div[id^='picture_']",
    	drop: function(ev, ui) {
    	  //alert($(this).attr("id").split("-")[2] + ','+ $(this).attr("id").split("-")[1]+ ','+ $(this).attr("id").split("-")[3] + ','+ui.draggable.attr("id").split("_")[1]);	
    	  tmpaddFileToArticle( $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[3] ,ui.draggable.attr("id").split("_")[1], 'add_image' );
    	  //addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_img' );
    	  }
    });
    
    $(".dnd.filr").droppable({
      accept: "div[id^='inset_']",
    	drop: function(ev, ui) {
    	  tmpaddFileToArticle( $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[3] ,ui.draggable.attr("id").split("_")[1], 'add_file' );
    	  //addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_file' );
    	  }
    });
    
    $(".dnd.audr").droppable({
      accept: "div[id^='audio_']",
    	drop: function(ev, ui) {
    	  tmpaddFileToArticle( $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[3] ,ui.draggable.attr("id").split("_")[1], 'add_audio' );
    	  //addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_audio' );
    	  }
    });
    
	$(".dnd.boxr").droppable({
      accept: "tr[id^='infobox_']",
    	drop: function(ev, ui) {
    	  tmpaddFileToArticle( $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[3] ,ui.draggable.attr("id").split("_")[1], 'add_box' );
    	  //addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_box' );
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
    	  $("div[class='addedFile forImgr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent()) id='img_"+id+"'>Odstranit</a>"));
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
	
	//add ib
	$(".dnd.boxr").droppable({
      accept: "tr[id^='infobox_']",
    	drop: function(ev, ui) {
    	  var id = ui.draggable.attr("id").split("_")[1];
		  $("table[class='addedFile forBoxr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent())>Odstranit</a>"));
    	  $("fieldset").append("<input type='hidden' name='boxes[id_"+ id +"]' value='"+ id +"' id='newbox-"+ id +"'>");
    	  }
    });  
  } 
}

function removeElement(obj)
{
 obj.remove();
 $("input[id='linkedImages']").attr({ value: $("input[id='linkedImages']").attr("value").replace(new RegExp(obj.attr("id").split("_")[1] + '-', "g"), "") }); 
}

function tmpaddFileToArticle( model, controller, article, file, action )
{
  if(controller == "boxes") controller = "info_boxes"
  //alert(controller + ',' + article + ',' + file + ',' + action);
  $.ajax({
     type: 'POST',
     url: '/admin/'+ controller  +'/'+ action +'/'+ article +'/'+ file + '/' + model,
     dataType: 'script',
     error: function(msg) { alert("Chyba v přenosu dat."); },
     success: function(data, status) {
       //alert(data.picture.data_file_name);from json      
     }
   });
   return false; 
}

function tmpremoveFileFromArticle( model, controller, article, file, action )
{
  $.ajax({
     type: 'POST',
     url: '/'+controller+'/'+ action +'/'+ article +'/'+ file +'/'+ model,
     dataType: 'script',
     error: function(msg) { alert("Chyba v přenosu dat."); },
     success: function(data, status) {
       $("input[id='linkedImages']").attr({ value: $("input[id='linkedImages']").attr("value").replace(new RegExp(file + '-', "g"), "") });      
     }
   });
   return false;
}

function addFileToArticle( controller, article, file, action )
{
  if(controller == "info") controller = "info_boxes"
  //alert(controller + ',' + article + ',' + file + ',' + action);
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
       $("input[id='linkedImages']").attr({ value: $("input[id='linkedImages']").attr("value").replace(new RegExp(file + '-', "g"), "") });    
     }
   });
   return false;
}

function removeFileFromDailyquestion( article, file, action )
{
  $.ajax({
     type: 'POST',
     url: '/admin/dailyquestions/'+ action +'/'+ article +'/'+ file,
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
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
        $("input[id^='cancelSearch']").hide();
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
