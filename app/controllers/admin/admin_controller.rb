class Admin::AdminController < ResourceController::Base
  
  layout 'admin'
  
  before_filter { |c| Tag.current_user = c.current_user }
  
end