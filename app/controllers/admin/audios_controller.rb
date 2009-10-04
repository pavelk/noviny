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
  
  def add_audio
    @object = params[:class].constantize.find(params[:object])
    @audio = Audio.find(params[:id])
    @object.audios << @audio
    #@model = params[:class]
    
    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_audio
    @object = params[:class].constantize.find(params[:object])
    @audio = Audio.find(params[:id])
    @object.audios.delete(@audio)

    respond_to do |format|  
      format.js
    end 
  end
   
  private

    def set_user
      @audio.user_id = current_user.id
    end
      
end
