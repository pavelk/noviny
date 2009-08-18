module ApplicationHelper
  
  ICON_TYPES = %w[audio/mpg application/x-shockwave-flash application/zip application/pdf]
  
  #helpers for formatting date/time in jQuery date/time pickers
  def www_date(date)
    if date.nil?
      Time.now.strftime('%d/%m/%y')
    else  
      date.strftime('%d/%m/%y')
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
  
end
