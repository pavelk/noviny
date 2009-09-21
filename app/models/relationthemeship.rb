class Relationthemeship < ActiveRecord::Base
  
  belongs_to :theme
  belongs_to :reltheme, :class_name => "Theme"
  
end
