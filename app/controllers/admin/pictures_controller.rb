class Admin::PicturesController < Admin::AdminController
  
  #belongs_to :album
  
  create.before :set_user
  
  #new_action.before do
    #1.times { object }
  #end
  
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
      @picture.user_id = current_user.id
    end
  
end