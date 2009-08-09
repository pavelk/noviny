class ArticlePicture < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :picture
  
end
