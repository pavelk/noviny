# desc "Explaining what the task does"
namespace :auth do
  
  PLUGIN_ROOT = File.dirname(__FILE__) + '/..'

  desc 'Installs required javascript and css files to the public/javascripts and public/stylesheets directories'
  task :install do
    layout = File.join( PLUGIN_ROOT, "assets", "auth")
    puts "adding layout"
    FileUtils.cp_r layout, RAILS_ROOT + '/public/stylesheets/auth'
    
    FileList[PLUGIN_ROOT + '/assets/config/*'].each do |f|
      puts "ADDING config/" + File.basename(f)
      FileUtils.cp f, RAILS_ROOT + '/config'
    end
    
    FileList[PLUGIN_ROOT + '/assets/images/*'].each do |f|
      puts "ADDING images/" + File.basename(f)
      FileUtils.cp f, RAILS_ROOT + '/public/images'
    end
  end
  
  desc 'Uninstalls all javascript and css files that were created by the simple_cms:install'
  task :uninstall do
    puts "REMOVING layout"
    FileUtils.rm_rf RAILS_ROOT + '/public/stylesheets/auth'

    FileList[PLUGIN_ROOT + '/assets/config/*'].each do |file|
      puts "REMOVING /config/" + File.basename(file)
      rem_file = RAILS_ROOT + '/config/' + File.basename(file)
      FileUtils.rm rem_file if File.exists?(rem_file)
    end
    FileList[PLUGIN_ROOT + '/assets/images/*'].each do |file|
      puts "REMOVING /public/images/" + File.basename(file)
      rem_file = RAILS_ROOT + '/public/images/' + File.basename(file)
      FileUtils.rm rem_file if File.exists?(rem_file)
    end
  end

 #desc 'Installs dependencies(will_paginate)'
 # task :install_dependencies do
 #   puts "Installing plugin will_paginate..."
 #   puts `ruby script/plugin install http://github.com/mislav/will_paginate/tree/master/`
 # end
end
