class Author < ActiveRecord::Base
  
  #new migrations
  has_many :dailyquestion_authors
  has_many :dailyquestions, :through => :dailyquestion_authors
  #
  
  belongs_to :user
  has_many :articles
  has_many :sections
  
  has_many :author_pictures
  has_many :pictures, :through => :author_pictures
  
  has_many :author_insets
  has_many :insets, :through => :author_insets
  
  #virtual atribute for full name in views
  def full_name 
    [firstname, surname].join(" ") 
  end
  
  define_index do
    indexes firstname
    indexes surname
    indexes nickname
    indexes cv
  end
  
end
