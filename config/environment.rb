ENV['RAILS_ENV'] ||= 'production'

RAILS_GEM_VERSION = '2.3.2' unless defined? RAILS_GEM_VERSION

require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|
  
  config.gem 'authlogic',
             :version => '~> 2.1.0'
  config.gem 'haml',
             :version => '~> 2.0.9' 
  config.gem "mislav-will_paginate", :lib => "will_paginate", :source => "http://gems.github.com"

  config.active_record.default_timezone = :utc
  
  config.i18n.load_path = Dir[File.join(RAILS_ROOT, 'config', 'locales', '*.{rb,yml}')]
  config.i18n.default_locale = :cz
  
  config.action_controller.session_store = :active_record_store

  config.log_level = Logger::DEBUG
end
ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.default_charset = "utf-8"
ActionMailer::Base.raise_delivery_errors = true
ActionMailer::Base.smtp_settings = {
 :address => "localhost",
 :port => 25,
 :domain => "localhost"
}
