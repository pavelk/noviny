class ContentType < ActiveRecord::Base
  
  #Added by Jan Uhlar
  ZPRAVA = 1
  SLOUPEK = 2
  KOMENTAR = 3
  GLOSA = 4
  TIP = 14
  VIDEO = 19
  POEZIE = 28
  DOPISY = 29
  ############
  
  has_many :articles
  
  def video?
    return self.id == VIDEO || self.id == POEZIE
  end
  
  def self.author_image_types
    [SLOUPEK,KOMENTAR,GLOSA,DOPISY]
  end
  
  def self.ignore_down_boxes
    [ZPRAVA,SLOUPEK,KOMENTAR,GLOSA,DOPISY,TIP]
  end
  
end
