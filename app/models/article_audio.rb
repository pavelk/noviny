class ArticleAudio < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :audio
  
end
