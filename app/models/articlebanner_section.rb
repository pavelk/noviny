class ArticlebannerSection < ActiveRecord::Base
  
  belongs_to :article_banner
  belongs_to :section
  
end
