class AuthorPicture < ActiveRecord::Base
  
  belongs_to :author
  belongs_to :picture
  
end
