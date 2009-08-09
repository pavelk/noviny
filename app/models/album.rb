class Album < ActiveRecord::Base
  
  belongs_to :user
  has_many :pictures, :dependent => :destroy
    
  acts_as_nested_set

end
