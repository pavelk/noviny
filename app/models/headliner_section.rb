class HeadlinerSection < ActiveRecord::Base
  
  belongs_to :headliner_box
  belongs_to :section
  
end
