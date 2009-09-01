class Admin::AuthorsController < Admin::AdminController
  
  create.before :set_user, :process_adding_pictures, :process_adding_files
  update.before :set_user

  def index
    #debugger
    if(params[:search_author])
      @authors = Author.search params[:search_author], :page => params[:page], :per_page => 15
    else
      @authors = Author.all.paginate( :per_page => 15, :page => params[:page] )
    end 
    respond_to do |format|
      format.js
    end
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
  
  def add_img
    @author = Author.find(params[:art])
    @picture = Picture.find(params[:pic])
    @author.pictures << @picture

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_img
    @author = Author.find(params[:art])
    @picture = Picture.find(params[:pic])
    @author.pictures.delete(@picture)

    respond_to do |format|  
      format.js
    end 
  end
  
  def add_file
    @author = Author.find(params[:art])
    @file = Inset.find(params[:pic])
    @author.insets << @file

    respond_to do |format|  
      format.js
    end
  end
  
  def remove_file
    @author = Author.find(params[:art])
    @file = Inset.find(params[:pic])
    @author.insets.delete(@file)

    respond_to do |format|  
      format.js
    end 
  end

  private
  
    def process_adding_pictures
      if(params[:pictures])
        params[:pictures].each_value do |p|
          pict = Picture.find(p)
          @author.pictures << pict
        end
      end      
    end

    def process_adding_files
      if(params[:files])
        params[:files].each_value do |f|
          fil = Inset.find(f)
          @author.insets << fil
        end
      end      
    end

    def set_user
      @author.user_id = current_user.id
    end
end
