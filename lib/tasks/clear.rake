namespace :clear do  
  task :article_views => :environment do
    ArticleView.delete_all(["shown_date < ?",(Time.now-1.month)])
  end 
end