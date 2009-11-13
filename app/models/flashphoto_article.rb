class FlashphotoArticle < ActiveRecord::Base
  
  belongs_to :article
  
  has_attached_file :photo,
                    :url  => "/assets/article/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/article/:id/:style/:basename.:extension"
  
end
