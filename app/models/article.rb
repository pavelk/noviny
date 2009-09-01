class Article < ActiveRecord::Base
  acts_as_taggable
  version_fu do
    belongs_to :author, :class_name=>'::Author'
  end  
      
  belongs_to :user
  belongs_to :author
  
  belongs_to :section #added by Jan Uhlar
  belongs_to :subsection #added by Jan Uhlar
  
  belongs_to :content_type
  has_many :article_views #added by Jan Uhlar
  has_many :article_comments, :order=>"created_at" #added by Jan Uhlar
  
  has_many :article_pictures
  has_many :pictures, :through => :article_pictures
  
  has_many :article_insets
  has_many :insets, :through => :article_insets
  
  has_many :article_audios
  has_many :audios, :through => :article_audios
  
  has_many :article_sections
  has_many :sections, :through => :article_sections
  
  has_many :article_boxes
  has_many :info_boxes, :through => :article_boxes
  
  has_many :relationships
  has_many :relarticles, :through => :relationships
  
  define_index do
    indexes text
    indexes perex
    indexes poznamka
    indexes :name, :sortable => true
    indexes [author.firstname, author.surname], :as => :author_name
    indexes [tags.name, tags.description], :as => :tags
    indexes [sections.name, sections.description], :as => :sections
    indexes content_type.name, :as => :content_type_name
  end

  
  
  before_save do |a|
    ActiveRecord::Base.connection.execute "UPDATE articles SET priority_section = priority_section + 1 WHERE priority_section >= #{a.priority_section} && priority_section <= 9" 
    ActiveRecord::Base.connection.execute "UPDATE articles SET priority_home = priority_home + 1 WHERE priority_home >= #{a.priority_home} && priority_home <= 9" 
  end
  
  #Added by Jan Uhlar
  #Returns header of the article
  def head
    header = ""
    header += self.subsection.name + " " if self.subsection
    header += self.content_type.name
    return header
  end
  
  #Returns last articles limited as param
  def self.newest(limit=3)
    Article.find(:all,
                 :conditions=>["publish_date <= ?",Time.now],
                 :order=>"publish_date DESC",
                 :limit=>limit)
  end
  
  #Returns all articles paginated by current date as param
  #Conditions is publish_date <= Time.now!
  def self.all_by_date(date, page = 1, per_page = 10)
    Article.paginate(:all,
                     :conditions=>["publish_date >= ? AND publish_date <= ? AND publish_date <= ?",date.beginning_of_day,date.end_of_day,Time.now],
                     :page=>page,
                     :per_page=>per_page,
                     :order=>"publish_date DESC")
  end
  
  #Returns the array of readest articles from each section
  def self.all_readest(begin_date)
    readest = []
    arr = [Section::NAZORY,Section::DOMOV,Section::SVET,Section::UMENI]
    arr.each do |a|
      article = Article.find(:all,
                                 :conditions=>["articles.section_id = ? AND article_views.shown_date >= ? AND article_views.shown_date <= ?",a,begin_date,Time.now],
                                 :select=>"articles.*,COUNT(article_views.article_id) as c",
                                 :group=>"articles.id",
                                 :order=>"c DESC",
                                 :joins=>[:article_views]).first
      readest << article if article
    end
    return readest
  end
   
  #Returns top tags according to number of articles in each group
  #limited by param 'limit'
  def self.top_taggings(limit = 4) 
    Tagging.find(:all,
                 :select=>"taggings.tag_id,COUNT(taggings.taggable_id) as c",
                 :group=>"taggings.tag_id",
                 :order=>"c DESC",
                 :limit=>limit)
  end
  
  #Returns all today news from all sections
  def self.today_top_news(limit = 10)
    news_arr = [Section::DOMOV,Section::SVET,Section::UMENI]
    find(:all,
         :conditions=>["content_type_id = ? AND section_id IN (?) AND publish_date >= ? AND publish_date <= ?",ContentType::ZPRAVA,news_arr,Time.now.beginning_of_day,Time.now],
         :order=>"created_at ASC",
         :include=>[:section],
         :limit=>limit)
  end
  
  #Returns all today opinions from section NAZORY
  def self.today_top_opinions(limit = 10)
    news_arr = [Section::NAZORY]
    find(:all,
         :conditions=>["section_id IN (?) AND publish_date >= ? AND publish_date <= ?",news_arr,Time.now.beginning_of_day,Time.now],
         :order=>"priority_section ASC",
         :limit=>limit)
  end
  
  #Returns all today articles belonging to the section as params 'section_id'
  #limited by param 'limit'
  def self.today_from_section(section_id,limit = 4)
    find(:all,
         :conditions=>["section_id = ? AND publish_date >= ? AND publish_date <= ? AND priority_section > ?",section_id,Time.now.beginning_of_day,Time.now,0],
         :order=>"priority_section DESC",
         :include=>[:content_type],
         :limit=>limit)
  end
  
  #Returns all yesterday articles belonging to the section as params 'section_id'
  #limited by param 'limit'
  def self.yesterday_from_section(section_id,limit = 4)
    find(:all,
         :conditions=>["section_id = ? AND publish_date >= ? AND publish_date <= ? AND priority_section > ?",section_id,Time.now.yesterday.beginning_of_day,Time.now.yesterday.end_of_day,0],
         :order=>"priority_section DESC, publish_date DESC",
         :include=>[:content_type],
         :limit=>limit)
  end
  
  #Returns paginated articles from author given by 'author_id'
  def self.paginate_from_author(author_id, page = 1, per_page = 10)
    paginate(:all,
             :conditions=>["author_id = ? AND publish_date <= ?",author_id,Time.now],
             :order=>"publish_date DESC",
             :page=>page,
             :per_page=>per_page)
  end
  
  #Returns paginated articles from tag given by 'tag_id'
  def self.paginate_from_tag(tag_id, page = 1, per_page = 10)
    paginate(:all,
             :conditions=>["taggings.tag_id = ? AND publish_date <= ?",tag_id,Time.now],
             :order=>"publish_date DESC",
             :joins=>"INNER JOIN taggings ON taggings.taggable_id = articles.id",
             :page=>page,
             :per_page=>per_page)
  end
  
  def self.today_by_priority_home
    find(:all,
         :conditions=>["publish_date >= ? AND publish_date <= ? AND priority_home > ?",Time.now.beginning_of_day,Time.now,0],
         :order=>"priority_home DESC")
  end
  ########################## end added by Jan Uhlar 
  
  
   
end
