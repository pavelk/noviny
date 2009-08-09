class Admin::AlbumsController < Admin::AdminController
  
  create.before :set_user
  create.after  :set_parent
  update.after  :set_parent
  
  #before_filter :check_class
  

  #new_action.before do
    #1.times { object.pictures.build }
  #end
  
  #[create, update].each { |action| action.wants.html { redirect_to admin_albums_path } }
  
  
  def get_level
    case params[:id]
      when 'null': @albums = params[:type].camelize.constantize.all(:conditions => 'parent_id is NULL', :order => 'name ASC') 
      #when 'null': @albums = Album.roots
      else 
        @albums = params[:type].camelize.constantize.find(params[:id]).children
        @album = params[:type].camelize.constantize.find(params[:id])
    end
    
    @level = params[:id]
    @tree = params[:tree]
    
    respond_to do |format|  
      #format.html  { render :layout => false }
      format.js
    end    
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
    #wants.js { render :layout => false }
    wants.js { render :layout => false }
  end
  
     
  private
  
    def check_class
      params[:type] = 'album' if params[:type].blank?
      @album = params[:type].camelize.constantize
    end  
    
    def set_user
      @album.user_id = current_user.id
    end
    
    def set_parent
      if(params[:album][:parent_id].blank?)
        @album.move_to_root();
      else  
        @album.move_to_child_of Album.find(params[:album][:parent_id])
      end  
    end  
  
end
