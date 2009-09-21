#Added by Jan Uhlar
#Class handles view count of articles
class ArticleView < ActiveRecord::Base
  belongs_to :article
end
