#Added by Jan Uhlar
#Class for comments to articles
class ArticleComment < ActiveRecord::Base
  belongs_to :article
  belongs_to :user
  
  #Returns created_at at format: Úterý, 2.Srpna 2009, 11:34:24
  def comment_date
    date = self.created_at
    Web::Calendar::DAYS[date.wday - 1] + ", #{date.wday}" + ".#{Web::Calendar::MONTHS_[date.month-1]} #{date.year}, #{date.to_s(:cz_time)}:#{date.sec}"
  end   
end
