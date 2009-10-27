class HeadlinerBox < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :picture
  
  has_many :headliner_sections
  has_many :sections, :through => :headliner_sections
  
  has_many :headliner_articles
  has_many :articles, :through => :headliner_articles
  
  has_many :headliner_themes
  has_many :themes, :through => :headliner_themes
  
  has_many :flashphoto_headliners
  
  def info
    inf = ""
    inf += picture_title unless picture_title.blank?
    inf += ", #{picture.type_image}" unless picture.type_image.blank?
    inf += ", #{picture.author}" unless picture.author.blank?
    return inf
  end
  
end
