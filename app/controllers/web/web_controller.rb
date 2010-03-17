class Web::WebController < ApplicationController
  layout "web/referendum"
  include AuthSystem
  before_filter :set_variables
  before_filter :set_printable
  before_filter :app_config, :ident
  before_filter :check_authentication

  # Used to be able to leave out the action
  def process(request, response)
    catch(:abort) do
      super(request, response)
    end
    response
  end

  def this_auth
    @app
  end
  helper_method :this_auth

protected
   def add_breadcrumb name, url = ''  
     @breadcrumbs ||= []  
     url = eval(url) if url =~ /_path|_url|@/  
     @breadcrumbs << [name, url]  
   end  
   
   def self.add_breadcrumb name, url, options = {}  
     before_filter options do |controller|  
       controller.send(:add_breadcrumb, name, url)  
     end  
   end
   add_breadcrumb "Deník Referendum", "home_path"

   def set_variables
     @section = Section.find(:first,:conditions=>["name LIKE ?",unpretty_name(params[:name])],:select=>"id,name")
     @type = 1 #for partial readest menu
     @readest = Article.all_readest(Time.now-24.hours, 1, @section ? @section.id : 9999)
     @authors = Author.all_right
     @dtype = 1 #for partial discusses menu
     @discussed = Article.discussed(Time.now-24.hours,1)
   end
 
   def set_printable
     @printable = params[:print].to_i > 0
   end
   
  def pretty_id(object)
    return "#{object.id}-#{object.name.parameterize}" if object
  end
 
    def pretty_name(object)
      if object
        if (object.class.name == "Author")
          return "#{object.firstname.parameterize}-#{object.surname.parameterize}"
        else
          return "#{object.name.parameterize}" 
        end
      end
    end
    
    def unpretty_name(name)
      return name.gsub("-"," ") if name
    end
  
    def set_last_id
       cookies[:last_article_id] = nil
    end
private  

  def check_authentication
    flash[:error] = "" if flash[:error] == "Musíte se přihlásit pro přístup na tuto stránku."
    return false
  end
end
