class ThemeselectionTheme < ActiveRecord::Base
  
  belongs_to :tag_selection
  belongs_to :theme
  
end
