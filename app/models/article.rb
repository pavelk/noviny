class Article < ActiveRecord::Base
  acts_as_taggable
  version_fu do
    belongs_to :author, :class_name=>'::Author'
  end
  
  #new  migrations
  has_many :headliner_boxes
  has_many :article_banners
  
  has_many :headliner_articles
  has_many :headliner_boxes, :through => :headliner_articles
  # 
      
  belongs_to :user
  belongs_to :author
  
  has_many :article_selections
  
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
  
  #souvisejici clanky
  has_many :relationships
  has_many :relarticles, :through => :relationships
  
  has_many :inverse_relationships, :class_name => "Relationship", :foreign_key => "relarticle_id"
  has_many :inverse_relarticles, :through => :inverse_relationships, :source => :article
  
  define_index do
    indexes text
    indexes perex
    indexes poznamka
    indexes publish_date
    indexes created_at
    indexes updated_at, :sortable => true
    indexes :name, :sortable => true
    indexes [author.firstname, author.surname], :as => :author_name
    indexes [tags.name, tags.description], :as => :tags
    indexes [sections.name, sections.description], :as => :sections
    indexes content_type.name, :as => :content_type_name
    set_property :enable_star => true
    set_property :min_prefix_len => 3
  end

  #named_scope :by_publish_date, lambda { {:conditions => ["publish_date <= ?", Time.now.utc]} }
  named_scope :by_publish_date,  :conditions => ["publish_date <= ?", Time.now.utc]
  
  
  
  
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
  
  #pouze názory, definované typem článku (Glosa, Komentář, Sloupek), 
  #řazené podle priority a data, na HP pouze aktuální den, v případě že bude
  #méně jak 2 doplnit staršími 
  def self.home_opinions(beg_date = Time.now, limit = 5)
    length_limit = 2
    limit -= 1
    arr = [ContentType::SLOUPEK,ContentType::KOMENTAR,ContentType::GLOSA]
    ops = find(:all,
               :conditions=>["section_id = ? AND priority_home > ? AND publish_date >= ? AND publish_date <= ? AND content_type_id IN (?)",Section::NAZORY,0,beg_date.beginning_of_day,Time.now,arr],
               :order=>"publish_date DESC, priority_home DESC",
               :include=>[:content_type])
    return ops if ops.length >= length_limit
    return ops if limit == 0
    while ops.length < length_limit
      beg_date = Time.now - 1.days
      return Article.home_opinions(beg_date, limit)
    end     
  end
  
  #Returns last articles limited as param
  def self.newest(limit=3, section_id = nil)
    op = ""
    op += "section_id = '#{section_id}' AND " if section_id
    Article.find(:all,
                 :conditions=>["#{op}publish_date <= ?",Time.now],
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
      article = Article.find(:first,
                                 :conditions=>["articles.section_id = ? AND article_views.shown_date >= ? AND article_views.shown_date <= ?",a,begin_date,Time.now],
                                 :select=>"articles.*,COUNT(article_views.article_id) as c",
                                 :group=>"articles.id",
                                 :order=>"c DESC",
                                 :joins=>[:article_views])
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
    #news_arr = [Section::DOMOV,Section::SVET,Section::UMENI]
    find(:all,
         :conditions=>["content_type_id = ? AND publish_date >= ? AND publish_date <= ?",ContentType::ZPRAVA,(Time.now - 2.days).beginning_of_day,Time.now],
         :order=>"publish_date DESC,priority_section DESC",
         :include=>[:section],
         :limit=>limit)
  end
  
  #Returns all today opinions from section NAZORY
  def self.today_top_opinions(limit = 10)
    news_arr = [Section::NAZORY]
    find(:all,
         :conditions=>["section_id IN (?) AND publish_date >= ? AND publish_date <= ?",news_arr,(Time.now - 2.days).beginning_of_day,Time.now],
         :order=>"publish_date DESC",
         :include=>[:content_type],
         :limit=>limit)
  end
  
  #Returns all today articles belonging to the section as params 'section_id'
  #limited by param 'limit'
  def self.from_section(options={})
    def_options = {:section_id=>0,:ignore_arr => [0],:limit => 2, :from_date => nil}
    options = def_options.merge(options)
    op = ""
    if options[:from_date]
     op += " AND publish_date >= '#{options[:from_date].beginning_of_day.to_s(:db)}' AND publish_date <= '#{options[:from_date].end_of_day.to_s(:db)}'"
    end
    find(:all,
         :conditions=>["section_id = ? AND id NOT IN (?) AND publish_date <= ? AND priority_section > ?#{op}",options[:section_id],options[:ignore_arr],Time.now,0],
         :order=>"publish_date DESC, priority_section DESC",
         :include=>[:content_type],
         :limit=>options[:limit])
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
  
  #výstup z modulu Headlinový box, bude definován pro danný den a konkretní 
  #sekci, pokud není pro danný den vytvořen bere se starší datum
  def self.headliner_box(section_id = 0, beg_date = Time.now.to_date, limit = 2)
     box = HeadlinerBox.find(:first,
                             :conditions=>["headliner_sections.section_id = ? AND publish_date = ?",section_id,beg_date],
                             :joins=>[:headliner_sections],
                             :include=>[:article,:picture])
     return box unless box.blank?
     return nil if section_id == Section::VIKEND
     #pokud není definován pro sekci a danný den, 
     #zkontroluj existenci pro danný den a HP až pak teprve zobraz starší datum
     return Article.headliner_box(0,beg_date,limit) if section_id != 0
     return nil if limit == 0
     limit -= 1
      while box.blank?
        beg_date = beg_date - 1.days
        return Article.headliner_box(section_id,beg_date,limit)
      end
  end
  
  #Postranní boxy: výstup z modulu Grafické upoutávky (GP) / nezohledňuje se parametr Sekce
  #  - Logika zobrazení Grafické upoutávky: 
  #    - zobrazuje se vždy max. 8 nejnovějších
  #    - minimální počet je 5
  #    - maximální počet GP staršiho data je 3, tato podmínka platí pouze tehdy 
  #      je li naplněn minimální počet. Příklad mám 4 GP definované pro dnešek, 
  #      můžu doplnit 3x GP ze včerejška = celkem 7.
  def self.right_boxes(boxes = [], section_id = 0, beg_date = Time.now.to_date, limit_back = 2, limit_count = 8)
     boxes += ArticleBanner.find(:all,
                                :conditions=>["articlebanner_sections.section_id = ? AND article_banners.publish_date = ? AND articles.section_id != ?",section_id,beg_date,section_id],
                                :select=>"article_banners.*",
                                :joins=>[:articlebanner_sections, :article],
                                :include=>[:article,:picture],
                                :limit=>limit_count)
     return boxes if (boxes.length == limit_count)
     #return Article.right_boxes(boxes,0,beg_date,limit_back,limit_count) if section_id != 0
     return boxes if limit_back == 0
     limit_back -= 1
      while (boxes.length != limit_count)
        beg_date = (beg_date - 1.days).to_date
        return Article.right_boxes(boxes,section_id,beg_date,limit_back,3)
      end
  end
  ########################## end added by Jan Uhlar
  
   
end
