class Theme < Tag
  
  #new migrations
  has_many :headliner_themes
  has_many :headliner_boxes, :through => :headliner_themes
  
  has_many :theme_selections
  has_many :tag_selections, :through => :theme_selections
  #
  
  define_index do
    indexes description
    indexes :name, :sortable => true
  end
  
end
