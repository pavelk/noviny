class Web::WebController < ApplicationController
  layout "web/referendum"
  before_filter :set_variables

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
     @week =  Web::Calendar.week?
     @tags = Article.top_taggings(6)
     @type = 1 #for partial readest menu
     @readest = Article.all_readest(Time.now-24.hours)
     @authors = Author.find(:all,:limit=>10)
   end
 
private  
  def check_authentication
    
  end
end
