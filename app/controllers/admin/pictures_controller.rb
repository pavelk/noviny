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
      newparams = coerce(params)
      @picture = Picture.new(newparams[:picture])
      set_user
      if @picture.save
        flash[:notice] = "Successfully created upload."
        render :json => { 'status' => 'success' }
      else
        render :json => { 'status' => 'error' }
      end
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

  def coerce(params)
    if params[:picture].nil? 
      h = Hash.new 
      h[:picture] = Hash.new 
      h[:picture][:album_id] = params[:album_id] 
      h[:picture][:name] = params[:name] 
      h[:picture][:author] = params[:author] 
      h[:picture][:type_image] = params[:type_image] 
      h[:picture][:data] = params[:Filedata] 
      h[:picture][:data].content_type = MIME::Types.type_for(h[:picture][:data].original_filename).to_s
      h
    else 
      params
    end 
  end
  

    def set_user
      @picture.user_id = current_user.id
    end
  
end
