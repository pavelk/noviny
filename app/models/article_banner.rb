class ArticleBanner < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :picture
  
  has_many :articlebanner_sections
  has_many :sections, :through => :articlebanner_sections
  
end
