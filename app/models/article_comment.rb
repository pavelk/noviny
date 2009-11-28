#Added by Jan Uhlar
#Class for comments to articles
class ArticleComment < ActiveRecord::Base
  belongs_to :article
  belongs_to :web_user
  
  validates_presence_of :text, :message=>"Musíte vyplnit text"
  
 def article
   Article.find(self.article_id)
 end
 
 def web_user
   WebUser.find(self.web_user_id)
 end
 
  #Returns created_at at format: Úterý, 2.Srpna 2009, 11:34:24
  def comment_date
    date = self.created_at
    Web::Calendar::DAYS[date.wday - 1] + ", #{date.day}" + ".#{Web::Calendar::MONTHS_[date.month-1]} #{date.year}, #{date.to_s(:cz_time)}:#{date.sec}"
  end   
end
