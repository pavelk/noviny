class Album < ActiveRecord::Base
  
  belongs_to :user
  has_many :pictures, :dependent => :destroy
  
  #after_save :update_depth
  #after_update :save_pictures
  #attr_accessible :parent_id
  
  acts_as_nested_set

  

 
end
