#Class handles view count of articles
class ArticleView < ActiveRecord::Base
  belongs_to :article


  def self.count(article_id, shown_date = Time.now)
    view = ArticleView.find(:first, :conditions => [ "article_id = ? and shown_date >= ?", article_id, shown_date - 24.hours ] )
    if view
      view.update_attributes(:count => ( view.count + 1 ))
    else
      ArticleView.create(:article_id => article_id, :shown_date => shown_date, :count => 1 )
    end
  end

end
