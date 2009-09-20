class ContentType < ActiveRecord::Base
  
  #Added by Jan Uhlar
  ZPRAVA = 1
  SLOUPEK = 2
  KOMENTAR = 3
  GLOSA = 4
  VIDEO = 19
  ############
  
  has_many :articles
  
end
