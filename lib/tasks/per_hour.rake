namespace :per_hour do  
  task :clear_cache => :environment do
    cache = ActiveSupport::Cache.lookup_store(:file_store, "/tmp/cache")
    puts cache.delete('Author.all_right')
    puts cache.delete('Article.all_readest.3')
    puts cache.delete('Article.all_readest.2')
    puts cache.delete('Article.all_readest.1')
    puts cache.delete('Article.newest')
    puts 'cache cleared'
  end 
end