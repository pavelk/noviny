class ContentType < ActiveRecord::Base
  
  #Added by Jan Uhlar
  ZPRAVA = 1
  SLOUPEK = 2
  KOMENTAR = 3
  GLOSA = 4
  ANALYZA = 5
  ESEJ = 6
  RECENZE = 7
  KRITIKA = 8
  REPORTAZ = 9
  DOKUMENT = 10
  ROZHOVOR = 11
  FEJETON = 12
  ZIVE = 13
  TIP = 14
  VZPOMINKA = 15
  VYPRAVENI = 16
  POLEMIKA = 17
  YOUTUBEDNES = 19
  STESTI = 21
  PORTRET = 22
  POVIDKA = 24
  POEZIE = 28
  DOPISY = 29
  VIDEO = 30
  ############
  
  has_many :articles
  
  def video?
    return self.id == YOUTUBEDNES || self.id == POEZIE || self.id == VIDEO
  end
  
  def self.author_image_types
    [SLOUPEK,KOMENTAR,GLOSA,DOPISY]
  end
  
  def self.opinion_types
    self.author_image_types
  end
  
  def self.message_types
    [ZPRAVA]
  end
  
  def self.author_nick_types
    [ZPRAVA,GLOSA,YOUTUBEDNES,TIP,VIDEO]
  end
  
  def self.article_full_name
    [SLOUPEK, KOMENTAR, DOPISY, KRITIKA, RECENZE, REPORTAZ, ESEJ, ANALYZA, FEJETON, VZPOMINKA]
  end
  
  def self.author_types
    [SLOUPEK,KOMENTAR,ESEJ,ANALYZA,RECENZE,KRITIKA,FEJETON,VZPOMINKA,VYPRAVENI,PORTRET,POVIDKA,STESTI,DOPISY]
  end
  
  def self.ignore_down_boxes
    [ZPRAVA,SLOUPEK,KOMENTAR,GLOSA,DOPISY,TIP,POEZIE]
  end
  
  def self.other_types
    ContentType.all(:select=>"id",:conditions=>["id NOT IN (?)",self.opinion_types + self.message_types]).map{|a| a.id}
  end
  
end
