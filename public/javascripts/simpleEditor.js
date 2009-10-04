/*
* simpleEditor 0.1.0 - Simple WYSIWYG Editor jQuery Plugin
* Copyright (c) 2009 Jiri Petvaldsky
* http://www.puppeteers-lab.com
* Licensed under the GNU General Public License
* http://www.gnu.org/licenses/licenses.html
*/
(function($) {
    $.fn.simpleditor = function(options) {
		if (options && typeof (options) === "string") {
            var args = [];
            for (var i = 1; i < arguments.length; i++) { args.push(arguments[i]); }
            var htmlarea = simpleEditor(this[0]);
            var f = htmlarea[options];
            if (f) { return f.apply(htmlarea, args); }
        }
        return this.each(function() { simpleEditor(this, options); });
    };
    var simpleEditor = window.simpleEditor = function(elem, options) {
        if (elem.jquery) {
            return simpleEditor(elem[0]);
        }
        if (elem.simpleEditorObject) {
            return elem.simpleEditorObject;
        } else {
            return new simpleEditor.fn.init(elem, options);
        }    
    }
    simpleEditor.fn = simpleEditor.prototype = {
		init: function(elem, options) {		
            if (elem.nodeName.toLowerCase() === "textarea") {
                var opts = $.extend({}, simpleEditor.defaultOptions, options);
                elem.simpleEditorObject = this;

                var textarea = this.textarea = $(elem);
                var container = this.container = $("<div/>").addClass("simpleEditorContainer").width(textarea.width()).insertAfter(textarea);

                var toolbar = this.toolbar = $("<div/>").addClass("ToolBar").appendTo(container);

                var iframe = this.iframe = $("<iframe/>").height(textarea.height());
                iframe.width(textarea.width() - ($.browser.msie ? 0 : 4));
                var htmlarea = this.htmlarea = $("<div/>").append(iframe);

                container.append(htmlarea).append(textarea.hide());//hide();

                this.editorInit(opts);
                this.initToolBar(opts);
                this.attachEditorEvents();

                // Fix total height to match TextArea
                //iframe.height(iframe.height() - toolbar.height());
                toolbar.width(textarea.width() - 2);

                if (opts.loaded) { opts.loaded.call(this); }
            }
        },
        editorInit: function(options){
	        this.editor = this.iframe[0].contentWindow.document;
	        this.editor.designMode = 'on';
	        this.editor.open();
	        this.editor.write(this.toHtmlTags());
	        this.editor.close();
            var e = this.editor.createElement('link'); 
            e.rel = 'stylesheet'; 
            e.type = 'text/css'; 
            e.href = options.css; 
            this.editor.getElementsByTagName('head')[0].appendChild(e);
        },
		attachEditorEvents: function() {
	        var t = this;
	        $(this.editor.body).click(function() { t.updateTextArea(); })
	        $(this.editor.body).blur(function() { t.updateTextArea(); });
	        $(this.textarea).focus(function() { t.updateTextArea(); });
	        $(this.textarea).keydown(function() { t.updateHtmlArea(); });
	        $(this.textarea).change(function() { t.updateHtmlArea(); });
	        
	    },        
        dispose: function() {
            this.textarea.show().insertAfter(this.container);
            this.container.remove();
            this.textarea[0].simpleEditorObject = null;
        },
        insetTagSelection: function (tagName){
	        this.iframe[0].contentWindow.focus();	        
            var range = this.getSelectionRange();
            /*var xx = $(this.getBlockSelection()).parent();
            for (var i=0;i<xx.length;i++){
            	alert(xx[i]);
            }*/
            /*
            if (range != undefined){
	        	if ($.browser.msie) {
	                range.pasteHTML('<'+tagName+'>' + range.text + '</'+tagName+'>');
	            }
	            else {
	                var newNode = document.createElement(tagName);
	                range.surroundContents(newNode);
	            }
            }*/
        },
        getBlockSelection: function() {
            if ($.browser.msie) {
                return this.editor.selection;
            } else {
                return this.iframe[0].contentDocument.defaultView.getSelection();
            }
        },
        getSelectionRange: function() {
            var s = this.getBlockSelection();
            if (!s) { return null; }
            return (s.getRangeAt) ? s.getRangeAt(0) : s.createRange();
        },        
        execCommand: function(a, b, c) {
            this.iframe[0].contentWindow.focus();
            this.editor.execCommand(a, b || false, c || null);
            this.updateTextArea();
        },
        ec: function(a,b,c){
            this.execCommand(a,b,c);
        },
        queryCommandValue: function(a){
            this.iframe[0].contentWindow.focus();
            return this.editor.queryCommandValue(a);
        },
        qc: function(a){
            return this.queryCommandValue(a);
        },
        getSelectedHTML: function() {
            /// <summary>
            ///     Returns the HTML that is currently selected within the editor.
            /// </summary>
            /// <returns type="String" />
        },
        getSelection: function() {
            /// <summary>
            ///     Returns the Browser Selection object that represents the currently selected region of the editor.
            /// </summary>
            /// <returns type="Object" />
        },
        getRange: function() {
            /// <summary>
            ///     Returns the Browser Range object that represents the currently selected region of the editor. (This uses the "getSelection" method internally.)
            /// </summary>
            /// <returns type="Object" />
        },
        pasteHTML: function(html) {
            /// <summary>
            ///     Pastes HTML text into the editor, replacing any currently selected text and HTML elements.
            /// </summary>
            /// <param name="html" type="String">
            ///     The HTML text to paste/insert.
            /// </param>
        },
        cut: function() {
            /// <summary>
            ///     Copies the current selection to the clipboard and then deletes it.
            /// </summary>
        },
        copy: function() {
            /// <summary>
            ///     Copies the current selection to the clipboard.
            /// </summary>
        },
        paste: function() {
            /// <summary>
            ///     Overwrites the contents of the clipboard on the current selection.
            /// </summary>
        },
        bold: function() {    
        	this.ec("bold");    	
        },
        italic: function() {
        	this.ec("italic");    	
        },
        underline: function() { this.ec("underline"); },
        strikeThrough: function() { this.ec("strikethrough"); },

        image: function(url) {        	
        	simpleEditor.tempImage.activeSelection = this;
			simpleEditor.tempImage.src = '';
			simpleEditor.tempImage.id = -1;
			
			$('#imagePicker img').live("click",function(){
<<<<<<< HEAD:public/javascripts/simpleEditor.js
			  //alert("click");
=======
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:public/javascripts/simpleEditor.js
				simpleEditor.tempImage.src = $(this).attr('src');
				simpleEditor.tempImage.id = $(this).attr('id');
				tb_remove();
				
			});			
			$('#TB_window').live("unload",function(){
				if (simpleEditor.tempImage.src != ''){
					if (simpleEditor.tempImage.activeSelection != undefined){
						simpleEditor.tempImage.activeSelection.insertImage();				
					}
				}
			});
			//LOAD EXTERNALL WINDOW WITH LINKED IMAGES
			var imgIds = $('#'+simpleEditor.tempImage.idField).val();
			if (imgIds != '')
<<<<<<< HEAD:public/javascripts/simpleEditor.js
			  //alert(options.imageButton);
				tb_show("Kliknutím vyberte obrázek který chcete vložit.", "#?height=300&width=410", addImagesToTBBox(imgIds));
=======
				tb_show("Kliknutím vyberte obrázek který chcete vložit.", "imageHandler.html?height=300&width=410&ids="+imgIds, null);
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:public/javascripts/simpleEditor.js
			else
				alert('Vyberte nejprve nějaké obrázky');
        },
        insertImage: function() {
	        simpleEditor.tempImage.activeSelection = undefined;
        	if ($.browser.msie && !url) {
                this.ec("insertImage", true);
            } else {
                this.ec("insertImage", false, (simpleEditor.tempImage.src));
            }
            this.updateImageId(simpleEditor.tempImage.id);
        },
        updateImageId:function(id){
	        if (id != -1){	        	
	        	$(this.editor).find('img').each(function(){
		        	if ($(this).attr('id') == '') {
			        	$(this).attr('id',simpleEditor.tempImage.id);
		        	}        	
	        	});
	        	simpleEditor.tempImage.id = -1;
	        }
        },
        removeFormat: function() {
            this.ec("removeFormat", false, []);
            this.unlink();
        },
        
		link: function() {
            if ($.browser.msie) {
                this.ec("createLink", true);
            } else {
                this.ec("createLink", false, prompt("Link URL:", "http://"));
            }
        },
        unlink: function() { this.ec("unlink", false, []); },
        orderedList: function() { this.ec("insertorderedlist"); },
        unorderedList: function() { this.ec("insertunorderedlist"); },
        superscript: function() { this.ec("superscript"); },
        subscript: function() { this.ec("subscript"); },

        h1: function() {
            this.insetTagSelection("h1");
        },
        h2: function() {
            this.insetTagSelection("h2");
        },
        h3: function() {
            this.insetTagSelection("h3");
        },
        h4: function() {
            this.insetTagSelection("h4");
        },
        h5: function() {
            this.insetTagSelection("h5");
        },
        h6: function() {
            this.insetTagSelection("h6");
        },
        heading: function(h) {      },
        indent: function() {        },
        outdent: function() {       },

        insertHorizontalRule: function() {
            this.ec("insertHorizontalRule", false, "ht");
        },
        justifyLeft: function() {        },
        justifyCenter: function() {        },
        justifyRight: function() {        },
        increaseFontSize: function() {        },
        decreaseFontSize: function() {        },
        forecolor: function(c) {        },
        formatBlock: function(v) {        },

        showHTMLView: function() {
            this.updateTextArea();
            this.textarea.show();
            this.htmlarea.hide();
            $("ul li:not(li:has(a.html))", this.toolbar).hide();
            $("ul:not(:has(:visible))", this.toolbar).hide();
            $("ul li a.html", this.toolbar).addClass("highlighted");
        },
        hideHTMLView: function() {
            this.updateHtmlArea();
            this.textarea.hide();
            this.htmlarea.show();
            $("ul", this.toolbar).show();
            $("ul li", this.toolbar).show().find("a.html").removeClass("highlighted");
        },
        toggleHTMLView: function() {
            (this.textarea.is(":hidden")) ? this.showHTMLView() : this.hideHTMLView();
        },

		toHtmlString: function() { 
			var htmlContent = this.editor.body.innerHTML;
			htmlContent = htmlContent.replace(/<br[a-zA-Z0-9\ \=\"\:\;\'\-^>]{0,999}>/g,'\n');
			htmlContent = htmlContent.replace(/ class=\"Apple-style-span\"/g,'');
			return htmlContent; 
		},
		toHtmlTags: function(){
			var htmlContent = this.textarea.val();
			htmlContent = htmlContent.replace(/\n/g,'<br>');
			htmlContent = htmlContent.replace(/\t/g,'');			
			return htmlContent;
		},
        toString: function() { return this.editor.body.innerText; },

        updateTextArea: function() { this.textarea.val(this.toHtmlString()); },
        updateHtmlArea: function() { this.editor.body.innerHTML = this.toHtmlTags(); },        
        isArray: function(v){
	        return v && typeof v === 'object' && typeof v.length === 'number' && typeof v.splice === 'function' && !(v.propertyIsEnumerable('length'));
	    },
	    initToolBar: function(options) {
	        var that = this;
			var lang = simpleEditor.languageCs;
	        var menuItem = function(className, altText, action) {
	            return $("<li/>").append($("<a href='javascript:void(0);'/>").addClass(className).attr("title", altText).click(function() { action.call(that, $(this)); }).append('<span>'+altText+'</span>'));
	        };
	
	        function addButtons(arr){
	            var ul = $("<ul/>").appendTo(that.toolbar);
	            for (var i = 0; i < arr.length; i++) {
	                var e = arr[i];
	                if ((typeof (e)).toLowerCase() === "string") {
	                    if (e === "|") {
	                        ul.append($('<li class="separator"/>').append('<span>|</span>'));
	                    } else {
	                    	var checkImage = true;
	                    	if (e == 'image')
	                    		if (options.imageButton == false) checkImage = false;
	                    		else simpleEditor.tempImage.idField = options.imageButton;
	                    	if (checkImage){
		                        var f = (function(e) {
		                            var m = simpleEditor.toolbarButtons[e] || e;
		                            if ((typeof (m)).toLowerCase() === "function") {
		                                return function(btn) { m.call(this, btn); };
		                            } else {
		                                return function() { this[m](); this.editor.body.focus(); };
		                            }
		                        })(e.toLowerCase());
		                        var t = lang[e.toLowerCase()];
		                        ul.append(menuItem(e.toLowerCase(), t || e, f));
			                }
	                    }
	                } else {
	                    ul.append(menuItem(e.css, e.text, e.action));
	                }	                
	            }
	        };
	        if (options.toolbar.length !== 0 && this.isArray(options.toolbar[0])){
	            for(var i = 0; i < options.toolbar.length; i++){
	                addButtons(options.toolbar[i]);
	            }
	        } else {
	            addButtons(options.toolbar);
	        }
	    }
    };
    simpleEditor.fn.init.prototype = simpleEditor.fn;
    
    simpleEditor.defaultOptions = {
	    toolbar: [
	    ["html"],["bold","italic","underline","|","orderedlist","unorderedlist","|","link","unlink","image","|","remove"]
	    ],
	    imageButton: false,
	    css: 'style/simpleEditor.View.css'
	};	
	simpleEditor.toolbarButtons = {
        strikethrough: "strikeThrough", orderedlist: "orderedList", unorderedlist: "unorderedList",
        horizontalrule: "insertHorizontalRule",
        /*justifyleft: "justifyLeft",justifycenter: "justifyCenter",justifyright: "justifyRight",
        increasefontsize: "increaseFontSize", decreasefontsize: "decreaseFontSize",*/
        remove:"removeFormat",
        html: function(btn) {
            this.toggleHTMLView();
        }
    };
    simpleEditor.tempImage = {
    	activeSelection: undefined,
    	id:-1,
    	src:'',
    	idField:''
    };
	simpleEditor.languageCs = {
		editorItems:{
	    	bold: "Bold", 
	    	italic: "Italic", 
	    	underline: "Underline", 
	    	strikethrough: "Strike-Through",
	        cut: "Cut", 
	        copy: "Copy", 
	        paste: "Paste",
	        h1: "Heading 1", 
	        h2: "Heading 2", 
	        h3: "Heading 3", 
	        h4: "Heading 4", 
	        h5: "Heading 5", 
	        h6: "Heading 6",
	        indent: "Indent", 
	        outdent: "Outdent", 
	        horizontalrule: "Insert Horizontal Rule",
	        justifyleft: "Left Justify", 
	        justifycenter: "Center Justify", 
	        justifyright: "Right Justify",
	        increasefontsize: "Increase Font Size", 
	        decreasefontsize: "Decrease Font Size", 
	        forecolor: "Text Color",
	        link: "Insert Link", 
	        unlink: "Remove Link", 
	        image: "Insert Image",
	        orderedlist: "Insert Ordered List", 
	        unorderedlist: "Insert Unordered List",
	        subscript: "Subscript", 
	        superscript: "Superscript",
	        html: "Show/Hide HTML Source View"
		}
	};	   
})(jQuery);

