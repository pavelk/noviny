class Admin::InsetsController < Admin::AdminController
  
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
  
  def add_file
    @object = params[:class].constantize.find(params[:object])
    @inset = Inset.find(params[:id])
    @object.insets << @inset
    #@model = params[:class]
    
    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_file
    @object = params[:class].constantize.find(params[:object])
    @inset = Inset.find(params[:id])
    @object.insets.delete(@inset)

    respond_to do |format|  
      format.js
    end 
  end
   
  private

    def set_user
      @inset.user_id = current_user.id
    end
  
  
end
