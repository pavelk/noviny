namespace :sessions do  
  task :clear => :environment do
    ActiveRecord::SessionStore::Session.delete_all [ "updated_at < ?", 2.weeks.ago ]
  end 
end