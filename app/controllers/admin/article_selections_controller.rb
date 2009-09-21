class Admin::ArticleSelectionsController < Admin::AdminController
  
  create.after :set_values
  update.after :set_values
  
  def index
    #debugger
    if(params[:search_article_selections])
      @article_selections = ArticleSelection.search params[:search_article_selections], :page => params[:page], :per_page => 20
    else  
      @article_selections = ArticleSelection.all.paginate( :per_page => 20, :page => params[:page] )
    end   
    respond_to do |format|  
      format.js
    end
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
      publish_date = params[:publish_date].split('/').reverse.join('-')
      article_id = params[:related_main].shift[1]
      sidebar_articles_ids = params[:related_sidebar].values.join(",")
      @article_selection.update_attributes( :publish_date => publish_date, :article_id => article_id, :sidebar_articles_ids => sidebar_articles_ids)  
    
    end  
   
end
