class Admin::ThemesController < Admin::AdminController
  
  create.after :process_related 
  update.after :process_related
  
  def index
    #debugger
    if(params[:search_theme])
      @themes = Theme.search params[:search_theme], :page => params[:page], :per_page => 15
    else
      @themes = Theme.all.paginate( :per_page => 15, :page => params[:page] )
    end 
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
  
  private
  
    def process_related
      if(params[:related_main])
        params[:related_main].each_value do |r|
          relationthemeship = @theme.relationthemeships.build(:reltheme_id => r)
          relationthemeship.save
        end
      end  
    end
  
  
end
