class TagSelection < ActiveRecord::Base
  
  has_many :theme_selections
  has_many :themes, :through => :theme_selections
  
  has_many :theme_selections
  has_many :sections, :through => :theme_selections
  
end
