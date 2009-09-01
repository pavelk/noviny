class Admin::ThemesController < Admin::AdminController
  
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
  
  
end
