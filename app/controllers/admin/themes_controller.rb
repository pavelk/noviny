class Admin::ThemesController < Admin::AdminController
  
  create.after :process_related 
  update.after :process_related
  
  def index
    #debugger
    if(params[:search_themes])
      @themes = Theme.search params[:search_themes], :page => params[:page], :per_page => 15, :order => 'name ASC'
    else
      @themes = Theme.all( :order => 'name ASC' ).paginate( :per_page => 15, :page => params[:page] )
    end 
    render 'shared/admin/index.js.erb'
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
