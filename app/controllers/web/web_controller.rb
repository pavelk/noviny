class Web::WebController < ApplicationController
  layout "web/referendum"
  before_filter :set_variables
  before_filter :set_printable

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
     @tags = Article.top_taggings(6)
     @type = 1 #for partial readest menu
     @readest = Article.all_readest(Time.now-24.hours)
     @authors = Author.all_right
     @newest = Article.newest
   end
 
    def set_printable
      @printable = params[:print] ? true : false
    end
private  
  def check_authentication
    
  end
end
