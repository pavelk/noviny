class Admin::HeadlinerBoxesController < Admin::AdminController
  
  create.after :process_related, :set_values, :process_sections
  update.after :process_related, :set_values, :process_sections
  #create.after :set_values, :process_sections
  #update.after :set_values, :process_sections
  
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
  
  def delete
    headliner_article = HeadlinerArticle.find(params[:rel])
    headliner_article.destroy
    
    render :nothing => true
  end
  
  private
  
    def process_related
      if(params[:related_sidebar])
        params[:related_sidebar].each_value do |r|
          art = Article.find(r)
          @headliner_box.articles << art
        end
      end
      if(params[:related_main])
        article_id = params[:related_main].shift[1]
        @headliner_box.update_attributes( :article_id => article_id )
      end
    end
  
    def set_values
      #debugger
      #params[:article_banner][:publish_date] = params[:article_banner][:publish_date].split('/').reverse.join('-')
      @headliner_box.update_attributes( :publish_date => params[:headliner_box][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      #debugger
      @headliner_box.attributes = {'section_ids' => []}.merge(params[:headliner_box] || {})
    end
  
end
