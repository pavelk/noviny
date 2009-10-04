class TextPageInset < ActiveRecord::Base
  
  belongs_to :text_page
  belongs_to :inset
  
end
