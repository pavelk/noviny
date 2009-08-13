module ApplicationHelper
  
  
  #helpers for formatting date/time in jQuery date/time pickers in edit actions
  def www_date(date)
    date.strftime('%d/%m/%y') unless date.nil?
  end
  
  def www_time(date)
    date.to_s[11..15] unless date.nil?
  end    
  
end
