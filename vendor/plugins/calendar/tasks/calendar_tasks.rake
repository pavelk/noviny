namespace :calendar do
  desc "install calendar"
  task :install  => :environment do
    Migrator.copy_files()
  end
end
