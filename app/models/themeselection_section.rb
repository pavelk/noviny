class ThemeselectionSection < ActiveRecord::Base
  
  belongs_to :tag_selection
  belongs_to :section
  
end