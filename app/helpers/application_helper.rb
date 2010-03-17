module ApplicationHelper
  
  ICON_TYPES = %w[audio/mpg application/x-shockwave-flash application/zip application/pdf]
  
  #Added by Jan Uhlar
  #Loading spinner indicator icon tag
  def spinner_tag(id = 'ident')
    image_tag('web/spinner.gif', :id=>"#{id}_spinner", :align => 'absmiddle', :style=> 'display:none;border:none;', :alt => 'loading...' )
  end
  
  def foot_rss(rss)
    @show_rss = true
    content_for(:rss) { link_to "RSS","feed://#{home_url.sub('http://','').gsub('/','')}#{rss}"}
  end
  
  def comments_info(number)
    str = "#{number} "
    if number == 0
      str += "příspěvků"
    elsif number == 1
      str += "příspěvek"
    elsif number < 5
      str += "příspěvky"
    else
      str += "příspěvků"
    end
    str
  end
  
  def exit_span
    "<span class=\"exits\" style=\"float:right;cursor:pointer;\" onclick=\"jQuery('.activeOverlay').remove();\">X</span>"
  end
    
  def pretty_id(object)
    return "#{object.id}-#{object.name.parameterize}" if object  
  end
  
  def pretty_name(object)
    if object  
      if (object.class.name == "Author")
        return "#{object.firstname.parameterize}-#{object.surname.parameterize}"
      else
        return "#{object.name.parameterize}" 
      end
    end
  end
  
  def article_name(article)
    arr = [ContentType::SLOUPEK,ContentType::KOMENTAR,ContentType::DOPISY]
    if arr.include?(article.content_type_id) && article.author
      return "#{article.author.full_name}: #{article.name}"
    else
      return article.name
    end
  end
  
  def will_paginate(arr,options = {})
    super(arr,options.merge(:prev_label=>"Předchozí",:next_label=>"Další"))
  end
  
  def main_image_tag(path,options={})
    image_tag("#{path}",options)
  end
  
  def week?
    Web::Calendar.week?
  end
  
  def th(text)
    #<img style="width: 144px; height: 96px;" id="img_35" src="/assets/pictures/35/small/Die_Welle.jpg?1256560529">
    match = text.match(/<img .*?src=".*?(\/small\/).*?">/)
    if match
      text = text.gsub(match[1],"/hp_main/")
    end
    match_two = text.match(/<img .*?(style=".*?").*?>/)
    text = text.sub(match_two[1],"") if match_two
    return text.gsub("\r\n","<br>").gsub("\n","<br>").gsub("___","&nbsp;")
  end
  
  #Returns normalize form of string for formatting the url
  #Example: 'Kůň úpěl' -> 'kun-upel'
  def norm_string(string)
    string.chars.downcase.normalize(:kd).to_s.gsub(/[^\x00-\x7F]/, '').gsub(' ','-')
  end
  
  #Added by Jan Uhlar
  #Returns first picture link for article
  def article_first_photo(article)
    arr = ContentType.author_image_types
    if (article.section_ids.include?(Section::NAZORY) || arr.include?(article.content_type_id))
      author = article.author
      return link_to(main_image_tag(author.pictures.first.data.url(:author_little)), detail_article_path(pretty_id(article))) if author && author.pictures.first
    else
      return article_photo(article)
    end
  end
  
  #Added by Jan Uhlar
  #Returns first picture link for article
  def article_photo(article)
    if (fh = FlashphotoArticle.find(:all,:conditions=>{:article_id=>article.id},:order=>"updated_at DESC").first)
      link_to(main_image_tag(fh.photo.url), detail_article_path(pretty_id(article)))
    elsif (ap = article.pictures.first)
      link_to(main_image_tag(ap.data.url(:preview_bottom)), detail_article_path(pretty_id(article))) 
    end
  end
  
  #Added by Jan Uhlar
  #Ajax link on home page (readest articles)
  def remote_readest_link(name,begin_date,type, section_id = nil)
    link_to_remote name || "24 hodin",:url=>{:controller=>"web/ajax",:action=>"update_readest",:begin_date=>begin_date || (Time.now-24.hours),:type=>type || 1, :section_id=>section_id},:loading=>"Element.show('readest_spinner');",:complete=>"Element.hide('readest_spinner');"
  end
  
  def remote_discuss_link(name,begin_date,type, section_id = nil)
    link_to_remote name || "24 hodin",:url=>{:controller=>"web/ajax",:action=>"update_discuss",:begin_date=>begin_date || (Time.now-24.hours),:dtype=>type || 1, :section_id=>section_id},:loading=>"Element.show('discuss_spinner');",:complete=>"Element.hide('discuss_spinner');"
  end
  
  #return id for form object
  def return_id(obj)
    if(obj.new_record?)
      'new_rec'
    else
       obj.id 
    end  
  end
  
  #return class name as string for forms
  def return_classname(obj)
    obj.class.name.underscore
  end     
  
  #helpers for formatting date/time in jQuery date/time pickers
  def www_date(date)
    if date.nil?
      Time.now.strftime('%d/%m/%Y')
    else  
      date.strftime('%d/%m/%Y')
    end
  end
  
  def www_time(date)
    date.to_s[11..15] unless date.nil?
  end
  
  def admin_date(date)
    date.strftime('%d/%m/%y') rescue nil
  end
  
  def content_types_order
    ct_first = ContentType.all( :conditions => 'id = 1' )
    ct_alphabet = ContentType.all( :order => 'name ASC', :conditions => 'id <> 1'  )
    ct = ct_first + ct_alphabet
    return ct
  end    
  
  #icons
  def add_icon(file_type)
    if(ICON_TYPES.include?(file_type))
      ICON_TYPES[ICON_TYPES.index(file_type)].sub('/', '_')
    else
      'file'
    end     
  end
  
  #versions
  def version( art )
    if( art.versions.size > 1 )
      link_to art.versions.size, "#", :onclick => "getVersions( '#{art.id}' ); return false;"
    else
      '1'
    end
  end        
  
end
