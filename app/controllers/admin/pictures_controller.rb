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
  
#  create.response do |wants|
#    wants.js { render :layout => false }
#  end

  def create
    newparams = params[:picture]
    new_image = Hash.new
    new_image['album_id'] = newparams[:album_id]
    new_image['user_id'] = current_user.id
    new_image['name'] = newparams[:name]
    new_image['author'] = newparams[:author]
    new_image['type_image'] = newparams[:type_image]

    newparams[:data].each do |image|
      new_image['data'] = image
      Picture.create(new_image)
    end
    redirect_to :action => :new
  end

  def add_image
    @object = params[:class].constantize.find(params[:object])
    @picture = Picture.find(params[:id])
    @object.pictures << @picture
    #@model = params[:class]
    
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
  
  def get_linked_imgs
    @pictures = Picture.all(:conditions => "id in (#{params[:imgs]})") 
    
    respond_to do |format|  
      format.js
    end
  end
   
  private

    def set_user
      @picture.user_id = current_user.id
    end
  
end
