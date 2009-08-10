class Article < ActiveRecord::Base
  acts_as_taggable
  
  belongs_to :user
  belongs_to :section
  belongs_to :subsection
  
  belongs_to :content_type
  
  has_many :article_pictures
  has_many :pictures, :through => :article_pictures
  
  before_save do |a|
    ActiveRecord::Base.connection.execute "UPDATE articles SET priority_section = priority_section + 1 WHERE priority_section >= #{a.priority_section} && priority_section <= 9" 
    ActiveRecord::Base.connection.execute "UPDATE articles SET priority_home = priority_home + 1 WHERE priority_home >= #{a.priority_home} && priority_home <= 9" 
  end 
  
  
   
end
