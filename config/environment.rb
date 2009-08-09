ENV['RAILS_ENV'] ||= 'development'

#RAILS_GEM_VERSION = '2.3.2' unless defined? RAILS_GEM_VERSION

require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|
  
  #config.gem 'fiveruns_tuneup'
  config.gem 'authlogic',
             :version => '~> 2.1.0'
  config.gem 'haml',
             :version => '~> 2.0.9'           
  
  #config.action_controller.use_accept_header = true
  
  config.time_zone = 'UTC'
  
  config.i18n.load_path = Dir[File.join(RAILS_ROOT, 'config', 'locales', '*.{rb,yml}')]
  config.i18n.default_locale = :cz

  config.action_controller.session_store = :active_record_store
  
end