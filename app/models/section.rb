class Section < ActiveRecord::Base
  
  #Added by Jan Uhlar  
    DOMOV = 1
    SVET = 2
    UMENI = 3
    NAZORY = 4
    VIKEND = 5
    FILM = 6
    HUDBA = 7
    VYTVARNE_UMENI = 8
    DIVADLO = 9
    LITERATURA = 10
  ###############
  
  acts_as_nested_set
  
  #Added by Jan Uhlar
  def self.all_root
    find(:all,:conditions=>{:parent_id=>nil},:order=>"position")
  end
  #################
  
  belongs_to :user
  belongs_to :author
  
  #has_many :articles
  has_many :article_sections
  has_many :articles, :through => :article_sections
  
  
end
