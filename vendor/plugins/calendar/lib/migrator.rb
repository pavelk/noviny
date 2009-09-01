  class Migrator
    class << self
      
      def copy_files
        if File.exists?("#{RAILS_ROOT}/vendor/plugins/calendar/config/javascripts")
           FileUtils.cp_r("#{RAILS_ROOT}/vendor/plugins/calendar/config/javascripts","#{RAILS_ROOT}/public/")
           puts "Copied javascripts"
        end
        if File.exists?("#{RAILS_ROOT}/vendor/plugins/calendar/config/images")
          FileUtils.cp_r("#{RAILS_ROOT}/vendor/plugins/calendar/config/images","#{RAILS_ROOT}/public/")
          puts "Copied images"
        end
        if File.exists?("#{RAILS_ROOT}/vendor/plugins/calendar/config/stylesheets")
          FileUtils.cp_r("#{RAILS_ROOT}/vendor/plugins/calendar/config/stylesheets","#{RAILS_ROOT}/public/")
          puts "Copied stylesheets"
        end
        puts "Successfully installed calendar."
      end
    end  # class << self

  end  # class Migrator