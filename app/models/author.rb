class Author < ActiveRecord::Base
  
  belongs_to :user
  
  has_many :author_pictures
  has_many :pictures, :through => :author_pictures
  
  def full_name 
    [firstname, surname].join(" ") 
  end
  
end
