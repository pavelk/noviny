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
  
  def add_image
    @object = params[:class].constantize.find(params[:object])
    @picture = Picture.find(params[:id])
    @object.pictures << @picture
    @model = params[:class]
    
    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_image
    @object = params[:class].constantize.find(params[:object])
    @picture = Picture.find(params[:id])
    @object.pictures.delete(@picture)

    respond_to do |format|  
      format.js
    end 
  end
  
   
  private

    def set_user
      @picture.user_id = current_user.id
    end
  
end