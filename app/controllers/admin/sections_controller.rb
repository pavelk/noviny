class Admin::SectionsController < Admin::AdminController
  
  create.before :set_user
  update.before :set_user
  create.after  :set_parent
  update.after  :set_parent
  
  index.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  new_action.response do |wants|
    wants.js
  end
  
  create.response do |wants|
    wants.js
  end
  
  private
  
  def set_user
    @section.user_id = current_user.id
  end
  
  def set_parent
    if(params[:section][:parent_id].blank?)
      @section.move_to_root();
    else  
      @section.move_to_child_of Section.find(params[:section][:parent_id])
    end  
  end
  
end