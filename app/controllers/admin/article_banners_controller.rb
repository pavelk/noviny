class Admin::ArticleBannersController < Admin::AdminController
  
  #create.before :set_values
  #update.before :set_values
  create.after :process_related, :set_values, :process_sections
  update.after :process_related, :set_values, :process_sections
  
  index.response do |wants|
    wants.js
  end
  
  new_action.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
    
  create.response do |wants|
    wants.js { render :layout => false }
  end
  
  private 
  
    def set_values
      #debugger
      #params[:article_banner][:publish_date] = params[:article_banner][:publish_date].split('/').reverse.join('-')
      @article_banner.update_attributes( :publish_date => params[:article_banner][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      @article_banner.attributes = {'section_ids' => []}.merge(params[:article_banner] || {})
    end
    
    def process_related
      if(params[:related_main])
        article_id = params[:related_main].shift[1]
        @article_banner.update_attributes( :article_id => article_id )
      end
    end  
  
end