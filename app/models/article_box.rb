class ArticleBox < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :info_box
  
end
