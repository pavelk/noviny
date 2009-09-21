class InfoBoxPicture < ActiveRecord::Base
  
  belongs_to :info_box
  belongs_to :picture
  
end
