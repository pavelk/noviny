class ArticleInset < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :inset
  
end
