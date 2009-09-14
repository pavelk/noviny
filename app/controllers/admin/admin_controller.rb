class Admin::AdminController < ResourceController::Base
  
  layout 'admin'
  
  before_filter { |c| Tag.current_user = c.current_user }
  
  index.response do |wants|
    wants.js
  end
  
  new_action.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  create.response do |wants|
    wants.js { render :layout => false }
  end
  
end