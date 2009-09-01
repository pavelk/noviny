module CalendarHelper
 def calendar(options = { :text_field => "date_from",
                          :value => Time.now.strftime("%d.%m.%Y"),
                          :update_div => nil,
                          :class_name => "cal"})
    ar = []                       
    up_div_id = options[:update_div].blank? ? "cal_#{options[:text_field]}" : options[:update_div]                      
    myvar = "#{options[:text_field]}_#{options[:class_name]}"
    onclick = "onclick=\"init('#{up_div_id}','#{options[:text_field]}','#{myvar}');\""
    input = text_field_tag(options[:text_field],options[:value],
                          {:class=>options[:class_name],:id=>options[:text_field],:onblur=>"checks(this);"})                 
    button = "<img src=\"..\/..\/..\/images\/calendar\/dpr_vis.gif\" style=\"cursor:pointer;\" value=\"K\" #{onclick} \/>"
    update_div = "<div id=\"#{up_div_id}\" class=\"#{options[:class_name]}\"></div>"
    ar << "<div class=\"calendar\">"
    ar << input
    ar << button
    ar << update_div if options[:update_div].blank?
    ar << "<\/div>"
    
    return ar.join("\n")
  end
end

