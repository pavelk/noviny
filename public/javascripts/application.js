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
  $("input[id$='publish_date']").livequery(function() {
     $.datepick.setDefaults({dateFormat: 'dd/mm/yy'});
     $(this).datepick({onSelect: pickedDate, defaultDate: null});
  });
  
  $("label[for$='0_author_id']").livequery(function() {
     $("p[class='dayQuestionYes']").append("<strong>Otazka ANO</strong>");
     $("p[class='dayQuestionNo']").remove();
  });
  
  $("label[for$='1_author_id']").livequery(function() {
     $("span[class='dayQuestionNo']").append("<strong>Otazka NE</strong>");
     $("p[class='dayQuestionYes']").remove();
  });  
  
});

/** ARTICLES **/
// date picker
function pickedDate( value, date, inst ) 
{ 
    if($("#article_publish_date").val().length == 0 )
    {
      $("#article_publish_date").val(value.split("/").reverse().join("-") + ' 00:00:00');
    }else{
      $("#article_publish_date").val(value.split("/").reverse().join("-") + $("#article_publish_date").val().substring(10,19));
    }   
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
      
          $(".pagination a").live("click", function() {
          $("#authors .listFilter > *").remove();
          $("#authors .listContent > *").remove();
          $.get(this.href, null, function ( data ){    
    	  }, "script");
        return false;
      });
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
        $("input[id^='cancelSearch']").hide();
        $(".pagination a").live("click", function() {
        $("#themes .listFilter > *").remove();
        $("#themes .listContent > *").remove();
        $.get(this.href, null, function ( data ){
            $("input[id^='cancelSearch']").hide();   
  	  }, "script");
      return false;
    });
        
        
        
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

function getBoxes( obj )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#infoboxes .listFilter > *").remove();
    $("#infoboxes .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
    
    $.ajax({
      type: 'GET',
      url: '/admin/info_boxes',
      dataType: 'script',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {
      }
    });
    return false;  
  }
}

function newBox()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/info_boxes/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() });     
    }
  });
  return false;
}

function editBox( obj )
{
  $("#listView").addClass("listSmall");
  alert($(obj).parent().parent().attr("id").split("_")[1]);
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/info_boxes/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
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
      $("input[id^='cancelSearch']").hide();
      //$("tr[id^='article_'] a.file").live("click", function() { return editArticle( $(this))} );
      //$("tr[id^='article_'] a.edit_article").live("click", function() { return editArticle( $(this))} );
      //$("a[id^='articles_new']").live("click", function() { return newArticle()} );
      
      $("div[id='articles'] .pagination a").live("click", function() {
      $("#articles .listFilter > *").remove();
      $("#articles .listContent > *").remove();
      $.get(this.href, null, function ( data ){
        $("input[id^='cancelSearch']").hide(); 
	  }, "script");
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
      $(".recordHeader a").bind("click", function() { return cancelArticle() });
      $("a[id^='file_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_file' ) });
      $("a[id^='img_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_img'  ) });
      $("a[id^='audio_']").bind("click", function() { return removeFileFromArticle( $(this).parent().parent().attr("id").split("_")[1], $(this).attr("id").split("_")[1], 'remove_audio'  ) });      
    }
  });
  return false;

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
  if (tb_id != null) thickbox_id = tb_id;
  if (relarticles.length > 0) relarticles.splice(0,relarticles.length);
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

function getRelationthemeship(tb_id)
{
  if (tb_id != null) thickbox_id = tb_id;
  //pole if (relarticles.length > 0) relarticles.splice(0,relarticles.length);
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

function getArticleSelections( obj  )
{
  if(obj.attr("class") == 'active')
  {
    obj.removeClass('active');
    obj.addClass('folder');
    $("#article_selections .listFilter > *").remove();
    $("#article_selections .listContent > *").remove();
  }else{
    obj.removeClass('folder');
    obj.addClass('active');
  
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/article_selections/',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      
    }
  });
  return false;
}
}

function newArticleSelection()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/article_selections/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      setCounterEvents();
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });     
    }
  });
  return false;
}

function editArticleSelection( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/article_selections/' + $(obj).parent().parent().attr("id").split("_")[1] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      setCounterEvents();
      $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
    }
  });
  return false;
  
}

function getDailyQuestions( obj )
{
    if(obj.attr("class") == 'active')
    {
      obj.removeClass('active');
      obj.addClass('folder');
      $("#daily_selections .listFilter > *").remove();
      $("#daily_selections .listContent > *").remove();
    }else{
      obj.removeClass('folder');
      obj.addClass('active');

    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: '/admin/dailyquestions/',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {

      }
    });
    return false;
  }
}

function newDailyQuestion()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/dailyquestions/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      setCounterEvents();
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });     
    }
  });
  return false;
  
}

function editDailyQuestion( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/dailyquestions/' + $(obj).parent().parent().attr("id").split("_")[2] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
    }
  });
  return false;  
}

function getHeadlinerBoxes( obj )
{
    if(obj.attr("class") == 'active')
    {
      obj.removeClass('active');
      obj.addClass('folder');
      $("#headliner_boxes .listFilter > *").remove();
      $("#headliner_boxes .listContent > *").remove();
    }else{
      obj.removeClass('folder');
      obj.addClass('active');

    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: '/admin/headliner_boxes/',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {

      }
    });
    return false;
  }
  
}

function newHeadlinerBox()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/headliner_boxes/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });     
    }
  });
  return false;
}

function editHeadlinerBox( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/headliner_boxes/' + $(obj).parent().parent().attr("id").split("_")[2] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
    }
  });
  return false;
}  


function getTagSelections( obj )
{
    if(obj.attr("class") == 'active')
    {
      obj.removeClass('active');
      obj.addClass('folder');
      $("#tag_selections .listFilter > *").remove();
      $("#tag_selections .listContent > *").remove();
    }else{
      obj.removeClass('folder');
      obj.addClass('active');

    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: '/admin/tag_selections/',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {

      }
    });
    return false;
  }
}

function newTagSelection()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/tag_selections/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });     
    }
  });
  return false; 
}

function editTagSelection( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/tag_selections/' + $(obj).parent().parent().attr("id").split("_")[2] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
    }
  });
  return false;
}

function getArticleBanners( obj )
{
    if(obj.attr("class") == 'active')
    {
      obj.removeClass('active');
      obj.addClass('folder');
      $("#article_banners .listFilter > *").remove();
      $("#article_banners .listContent > *").remove();
    }else{
      obj.removeClass('folder');
      obj.addClass('active');

    $.ajax({
      type: 'GET',
      dataType: 'script',
      url: 'admin/article_banners/',
      error: function(msg) { alert("Chyba v přenosu dat."); },
      success: function(data, status) {

      }
    });
    return false;
  }
}

function newArticleBanner()
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/article_banners/new',
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelLeaf() });     
    }
  });
  return false; 
}

function editArticleBanner( obj )
{
  $("#listView").addClass("listSmall");
  $.ajax({
    type: 'GET',
    dataType: 'script',
    url: '/admin/article_banners/' + $(obj).parent().parent().attr("id").split("_")[2] + "/edit",
    error: function(msg) { alert("Chyba v přenosu dat."); },
    success: function(data, status) {
      $(".recordHeader a").bind("click", function() { return cancelArticle() }); 
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



function dragAndDrop()
{  
  //add attachments / edit
  /*
  $(".dnd.imgr").droppable({
    accept: "div[id^='picture_']",
  	drop: function(ev, ui) {
      if($("form").attr("id").split("_")[0] == 'edit')
      {
  	    addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_img' );
  	  }  
  	  }
  });
  */
  $(".dnd.imgrs").droppable({
    accept: "div[id^='picture_']",
  	drop: function(ev, ui) {
  	  var id = ui.draggable.attr("id").split("_")[1];
  	  $("div[class='addedFile forImgr'] > *").remove();
  	  $("div[id='headliner_box_picture_id'] > *").remove();
  	  $("div[class='addedFile forImgr']").append(ui.draggable.clone());
  	  $("fieldset").append("<input type='hidden' id='headliner_box_picture_id' name='headliner_box[picture_id]' value='"+ id +"'>");  	  
  	}
  });
  
  if($("form").attr("id").split("_")[0] == 'edit')
  {
    $(".dnd.imgr").droppable({
      accept: "div[id^='picture_']",
    	drop: function(ev, ui) {
    	  //alert($(this).attr("id").split("-")[2] + ','+ $(this).attr("id").split("-")[1]+ ','+ $(this).attr("id").split("-")[3] + ','+ui.draggable.attr("id").split("_")[1]);	
    	  tmpaddFileToArticle( $(this).attr("id").split("-")[2], $(this).attr("id").split("-")[1], $(this).attr("id").split("-")[3] ,ui.draggable.attr("id").split("_")[1], 'add_image' );
    	  
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
    
	$(".dnd.boxr").droppable({
      accept: "tr[id^='infobox_']",
    	drop: function(ev, ui) {
    	  alert($(this).attr("id").split("_")[1]);
    	  addFileToArticle( $(this).attr("id").split("_")[1], $(this).attr("id").split("_")[2] ,ui.draggable.attr("id").split("_")[1], 'add_box' );
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
	
	//add ib
	$(".dnd.boxr").droppable({
      accept: "tr[id^='infobox_']",
    	drop: function(ev, ui) {
    	  var id = ui.draggable.attr("id").split("_")[1];
		  $("div[class='addedFile forBoxr']").append(ui.draggable.clone().append("<a onclick=removeElement($(this).parent())>Odstranit</a>"));
    	  $("fieldset").append("<input type='hidden' name='boxes[id_"+ id +"]' value='"+ id +"' id='newbox-"+ id +"'>");
    	  }
    });  
  } 
}

function removeElement(obj)
{
 obj.remove(); 
}

function tmpaddFileToArticle( model, controller, article, file, action )
{
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
     }
   });
   return false;
}

function addFileToArticle( controller, article, file, action )
{
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