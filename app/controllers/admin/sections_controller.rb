class Admin::SectionsController < Admin::AdminController
  
  create.before :set_user
  update.before :set_user
  create.after  :set_parent
  update.after  :set_parent
  
  def index
    if(params[:search_sections])
      @sections = Section.search params[:search_sections], :page => params[:page], :per_page => 10, :order => 'name ASC'
    else
      @sections = Section.all( :order => 'name ASC' ).paginate( :per_page => 10, :page => params[:page] )
    end
    render 'shared/admin/index.js.erb'
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
  
  def get_subsection
    if(params[:id] != 'new_rec')
      @object = params[:class].constantize.find(params[:id])
    else
      @object = params[:class].constantize.new 
    end  
    @section = Section.find(params[:section])
    @subsection = @section.children
    
    respond_to do |format|  
      format.js
    end
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
