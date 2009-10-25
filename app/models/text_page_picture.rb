class TextPagePicture < ActiveRecord::Base
  
  belongs_to :text_page
  belongs_to :picture
  
end
