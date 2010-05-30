#Added by Jan Uhlar
#Class for comments to articles
class ArticleComment < ActiveRecord::Base
  belongs_to :article
  belongs_to :web_user
  
  validates_presence_of :text, :message=>"Musíte vyplnit text"
  
  after_save :send_notification
  
 def article
   Article.find(self.article_id)
 end
 
 def web_user
   WebUser.find_by_id(self.web_user_id)
 end
 
  #Returns created_at at format: Úterý, 2.Srpna 2009, 11:34:24
  def comment_date
    date = self.created_at
    Web::Calendar::DAYS[date.wday - 1] + ", #{date.day}" + ".#{Web::Calendar::MONTHS_[date.month-1]} #{date.year}, #{date.to_s(:cz_time)}:#{date.sec}"
  end
  
  protected
  def send_notification
    if (wu = self.article.author.web_user)
      if wu.send_my_discuss_notification?
        begin
          Notification.deliver_discuss(self.article, wu.email)
        rescue
        end
      end
    end
    wus = self.article.article_comments.map {|ac| ac.web_user}.uniq.delete_if {|w| !w.send_discuss_notification?}
    wus.each do |web_user|
      begin
        Notification.deliver_discuss(self.article, web_user.email)
      rescue
      end
      sleep(0.25)
    end
  end
end
