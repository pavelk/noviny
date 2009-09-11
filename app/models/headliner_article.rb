class HeadlinerArticle < ActiveRecord::Base
  
  belongs_to :headliner_box
  belongs_to :article
  
end
