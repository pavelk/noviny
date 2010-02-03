namespace :per_hour do  
  task :clear_cache => :environment do
    Rails.cache.delete('Author.all_right')
    Rails.cache.delete('Article.all_readest')
    Rails.cache.delete('Article.newest')
    puts 'cache cleared'
  end 
end