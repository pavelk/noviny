class TagSelection < ActiveRecord::Base
  
  has_many :themeselection_sections
  has_many :sections, :through => :themeselection_sections
  
  has_many :themeselection_themes
  has_many :themes, :through => :themeselection_themes
  
end
