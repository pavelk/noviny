class Admin::ThemesController < Admin::AdminController
  
  create.after :process_related 
  update.after :process_related
  
  def index
    #debugger
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
    if(params[:search_themes])
      @themes = Theme.search params[:search_themes], :page => params[:page], :per_page => 15, :order => 'name ASC'
=======
=======
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
    if(params[:search_theme])
      @themes = Theme.search params[:search_theme], :page => params[:page], :per_page => 15, :order => 'name ASC'
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
=======
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
    else
      @themes = Theme.all( :order => 'name ASC' ).paginate( :per_page => 15, :page => params[:page] )
    end 
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
    render 'shared/admin/index.js.erb'
=======
=======
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
    respond_to do |format|
      format.js
    end
<<<<<<< HEAD:app/controllers/admin/themes_controller.rb
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
=======
>>>>>>> b3629e5af341a2900b688520acbfd8ceb10e201c:app/controllers/admin/themes_controller.rb
  end
  
  
  def get_relthemes
    #debugger
    @themes = Theme.all(:conditions => "id in (#{params[:related_themes].values.join(',')})") 
    
    respond_to do |format|  
      format.js
    end
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
  
  private
  
    def process_related
      if(params[:related_themes])
        params[:related_themes].each_value do |r|
          relationthemeship = @theme.relationthemeships.build(:reltheme_id => r)
          relationthemeship.save
        end
      end  
    end
  
  
end
