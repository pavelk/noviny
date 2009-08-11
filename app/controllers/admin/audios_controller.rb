class Admin::AudiosController < Admin::AdminController
  
  create.before :set_user
  

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
  
   
  private

    def set_user
      @audio.user_id = current_user.id
    end
      
end
