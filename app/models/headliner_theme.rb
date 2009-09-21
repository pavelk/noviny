class HeadlinerTheme < ActiveRecord::Base
  
  belongs_to :headliner_box
  belongs_to :theme
  
end
