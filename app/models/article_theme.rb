class ArticleTheme < ActiveRecord::Base
  belongs_to :article
  belongs_to :theme
end
