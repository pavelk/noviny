class Author < ActiveRecord::Base
  
  #new migrations
  #has_many :dailyquestion_authors
  #has_many :dailyquestions, :through => :dailyquestion_authors
  #
  has_many :dailyquestions
  
  belongs_to :user
  belongs_to :web_user
  has_many :articles
  has_many :sections
  
  has_many :author_pictures
  has_many :pictures, :through => :author_pictures
  
  has_many :author_insets
  has_many :insets, :through => :author_insets


before_save :update_web_user_id

  def web_user
    return WebUser.find(:first,:conditions=>{:author_id=>self.id})
  end
  
  #virtual atribute for full name in views
  def full_name 
    [firstname, surname].join(" ") 
  end
  
  define_index do
    indexes firstname
    indexes surname
    indexes nickname
    indexes cv
  end
  
  #Added by Jan Uhlar
  def whole_name
    return "#{self.firstname} #{self.surname}"
  end
  
  def self.all_right
    cache = ActiveSupport::Cache.lookup_store(:file_store, "/tmp/cache")
    cache.fetch('Author.all_right') do
      arr = ContentType.author_types
      find(:all,
           :select=>"max(publish_date) as m_pub,authors.id,authors.surname,authors.firstname",
           :joins=>[:articles],
           :conditions=>["articles.publish_date <= ? AND articles.content_type_id IN (?) AND articles.approved = ? AND articles.visibility = ?",Time.now,arr,true,false],
           :order=>"m_pub DESC",
           :limit=>25,
           :group=>"authors.id").sort { |x,y| x.surname.parameterize <=> y.surname.parameterize }
    end     
  end
  

private

  def update_web_user_id
    self.web_user_id = nil if self.web_user_id == 0
  end

end
