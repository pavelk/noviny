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
    arr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZěščřžýáíéúůóďťňöäëĚŠČŘŽÝÁÍÉÚŮÓĎŤŇÖÄËľĽüÜßß1234567890".split("")
    #arr = [".","!","?",":",";","\"","'","“","”","‚","‛","„","′","˝"]
    if !picture_title.blank?
      if !arr.include?(picture_title.last)
        inf += "#{picture_title}"
      else
        inf += "#{picture_title}." 
      end
    end
    if picture
      inf += " #{picture.type_image.capitalize}" unless picture.type_image.blank?
      inf += ": #{picture.author}" unless picture.author.blank?
    end
    return inf
  end
  
end
