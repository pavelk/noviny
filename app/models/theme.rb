class Theme < Tag
  
  #new migrations
  has_many :headliner_themes
  has_many :headliner_boxes, :through => :headliner_themes
  
  has_many :theme_selections
  has_many :tag_selections, :through => :theme_selections
  #
  
  has_many :article_themes
  has_many :articles, :through => :article_themes
  
  #souvisejici temata
  has_many :relationthemeships
  has_many :relthemes, :through => :relationthemeships
  
  #has_many :inverse_relationships, :class_name => "Relationship", :foreign_key => "relarticle_id"
  #has_many :inverse_relarticles, :through => :inverse_relationships, :source => :article
  
  define_index do
    indexes description
    indexes :name, :sortable => true
  end
  
end
