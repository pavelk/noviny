class Author < ActiveRecord::Base
  
  belongs_to :user
  
  def full_name 
    [firstname, surname].join(" ") 
  end
  
end
