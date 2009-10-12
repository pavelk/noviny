# Set load paths to include the plugin /app directory
controller_path = "#{File.dirname(__FILE__)}/app/controllers"
model_path      = "#{File.dirname(__FILE__)}/app/models"
helper_path     = "#{File.dirname(__FILE__)}/app/helpers"
$LOAD_PATH << controller_path
$LOAD_PATH << model_path
ActiveSupport::Dependencies.load_paths += [ controller_path, model_path, helper_path ]
#ActiveSupport::Dependencies.load_once_paths += [ controller_path, model_path, helper_path ]
config.controller_paths << controller_path

Dir["#{File.dirname(__FILE__)}/lib/*.rb"].each do |lib|
  require lib
end

class ActionController::Base
  def self.inherited(klass)
    klass.append_view_path(File.join(File.dirname(__FILE__),'app','views'))
    super
  end
  helper :auth
end