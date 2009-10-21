class Album < ActiveRecord::Base
  
  belongs_to :user
  has_many :pictures, :dependent => :destroy, :order => 'updated_at DESC'
  has_many :insets, :dependent => :destroy, :order => 'updated_at DESC'
  has_many :audios, :dependent => :destroy, :order => 'updated_at DESC'
    
  acts_as_nested_set

end
