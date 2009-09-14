module ApplicationHelper
  
  ICON_TYPES = %w[audio/mpg application/x-shockwave-flash application/zip application/pdf]
  
  #Added by Jan Uhlar
  #Loading spinner indicator icon tag
  def spinner_tag(id = 'ident')
    image_tag('web/spinner.gif', :id=>"#{id}_spinner", :align => 'absmiddle', :style=> 'display:none;border:none;', :alt => 'loading...' )
  end
  
  def main_image_tag(path,options={})
    image_tag("http://referendum.glow.cz#{path}",options)
  end
  
  #Returns normalize form of string for formatting the url
  #Example: 'Kůň úpěl' -> 'kun-upel'
  def norm_string(string)
    string.chars.downcase.normalize(:kd).to_s.gsub(/[^\x00-\x7F]/, '').gsub(' ','-')
  end
  
  #Added by Jan Uhlar
  #Returns first picture link for article
  def article_first_photo(article)
    arr = [ContentType::SLOUPEK,ContentType::KOMENTAR,ContentType::GLOSA]
    if (article.section_id == Section::NAZORY || arr.include?(article.content_type_id))
      author = article.author
      return link_to(main_image_tag(author.pictures.first.data.url(:preview_bottom)), :controller=>"web/articles",:action=>"detail",:id=>article.id) if author && author.pictures.first
    else
      return link_to(main_image_tag(article.pictures.first.data.url(:preview_bottom)), :controller=>"web/articles",:action=>"detail",:id=>article.id) if article.pictures.first
    end
  end
  
  #Added by Jan Uhlar
  #Ajax link on home page (readest articles)
  def remote_readest_link(name,begin_date,type)
    link_to_remote name || "24 hodin",:url=>{:controller=>"web/ajax",:action=>"update_readest",:begin_date=>begin_date || (Time.now-24.hours),:type=>type || 1},:loading=>"Element.show('readest_spinner');",:complete=>"Element.hide('readest_spinner');"
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
