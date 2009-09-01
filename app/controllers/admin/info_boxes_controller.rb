class Admin::InfoBoxesController < Admin::AdminController
  
  create.before :set_user
  create.after :process_adding_pictures
  
  def index
    #debugger
    if(params[:search_boxes])
      @info_boxes = InfoBox.search params[:search_boxes]
    else
      @info_boxes = InfoBox.all
    end 
    respond_to do |format|
      format.js
    end
  end 
  
  def add_img
    @info_box = InfoBox.find(params[:art])
    @picture = Picture.find(params[:pic])
    @info_box.pictures << @picture

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_img
    @info_box = InfoBox.find(params[:art])
    @picture = Picture.find(params[:pic])
    @info_box.pictures.delete(@picture)

    respond_to do |format|  
      format.js
    end 
  end
  
  new_action.response do |wants|
    wants.js
  end
  
  create.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  private
  
    def set_user
      @info_box.user_id = current_user.id
    end
    
    def process_adding_pictures
      if(params[:pictures])
        params[:pictures].each_value do |p|
          pict = Picture.find(p)
          @info_box.pictures << pict
        end
      end      
    end
  
end
