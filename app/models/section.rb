class Section < ActiveRecord::Base
  
  acts_as_nested_set
  
  has_many :articles
  
end
