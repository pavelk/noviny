class FlashphotoHeadliner < ActiveRecord::Base
  
  belongs_to :headliner_box
  
  has_attached_file :photo,
                    :url  => "/assets/headliner/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/headliner/:id/:style/:basename.:extension"
end
