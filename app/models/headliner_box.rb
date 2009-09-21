class HeadlinerBox < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :picture
  
  has_many :headliner_sections
  has_many :sections, :through => :headliner_sections
  
  has_many :headliner_articles
  has_many :articles, :through => :headliner_articles
  
  has_many :headliner_themes
  has_many :themes, :through => :headliner_themes
  
end
