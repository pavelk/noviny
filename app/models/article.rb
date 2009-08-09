class Article < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :section
  belongs_to :subsection
  
  belongs_to :content_type
  
  has_many :article_pictures
  has_many :pictures, :through => :article_pictures
  
end
