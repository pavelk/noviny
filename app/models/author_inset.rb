class AuthorInset < ActiveRecord::Base
  
  belongs_to :author
  belongs_to :inset
  
end
