class Section < ActiveRecord::Base
  HOME_SECTION_ID = 9999
  
  #new migrations
  has_many :headliner_sections
  has_many :headliner_boxes, :through => :headliner_sections
  
  has_many :articlebanner_sections
  has_many :article_banners, :through => :articlebanner_sections
  
  has_many :theme_selections
  has_many :tag_selections, :through => :theme_selections
  #
  
  #Added by Jan Uhlar  
    DOMOV = 1
    SVET = 2
    UMENI = 3
    NAZORY = 4
    VIKEND = 5
    FILM = 6
    HUDBA = 7
    VYTVARNE_UMENI = 8
    DIVADLO = 9
    LITERATURA = 10
  ###############
  
  acts_as_nested_set
  
  #Added by Jan Uhlar
  has_many :themeselection_sections
  has_many :tag_selections, :through => :themeselection_sections
  
  def self.all_root
    find(:all,:conditions=>{:parent_id=>nil},:order=>"position")
  end
  
  def top_themes(limit = 7)
    limit = 5 if self.id == UMENI
    first_tag_selection = self.tag_selections.first
    if first_tag_selection
      first_tag_selection.themes.first(limit)
    else
      Tag.find(:all,
               :joins=>"inner join article_themes on article_themes.theme_id = tags.id inner join article_views on article_views.article_id = article_themes.article_id",
               :select=>"tags.name,COUNT(distinct article_themes.article_id) as c",
               :conditions=>[""],
               :group=>"tags.id",
               :order=>"c DESC",
               :limit=>limit) 
    end
  end
  #################
  
  belongs_to :user
  belongs_to :author
  
  #has_many :articles
  has_many :article_sections
  has_many :articles, :through => :article_sections
  has_many :article_selections
  
  
  
  
end
