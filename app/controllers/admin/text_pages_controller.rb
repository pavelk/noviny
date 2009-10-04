class Admin::TextPagesController < Admin::AdminController  
  
  create.before :set_user, :process_adding_pictures, :process_adding_files
  update.before :set_user
  
  def index
    #debugger
    if(params[:search_text_pages])
      @text_pages = TextPage.search params[:search_text_pages], :page => params[:page], :per_page => 15
    else
      @text_pages = TextPage.all.paginate( :per_page => 15, :page => params[:page] )
    end 
    render 'shared/admin/index.js.erb'
  end

  show.response do |wants|
    wants.js
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
  
    def process_adding_pictures
      if(params[:pictures])
        params[:pictures].each_value do |p|
          pict = Picture.find(p)
          @text_page.pictures << pict
        end
      end      
    end

    def process_adding_files
      if(params[:files])
        params[:files].each_value do |f|
          fil = Inset.find(f)
          @text_page.insets << fil
        end
      end      
    end

    def set_user
      @text_page.user_id = current_user.id
    end
  
end
