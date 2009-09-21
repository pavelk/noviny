class Admin::RelationshipsController < Admin::AdminController
  
  def delete
    article = Article.find(params[:id])
    @relationship = article.relationships.find(params[:rel])
    @relationship.destroy
    render :nothing => true
  end
  
  def index
    if(params[:search_relationships])
      @relationships = Article.search params[:search_relationships], :page => params[:page], :per_page => 20
    else  
      @relationships = Article.all.paginate( :per_page => 20, :page => params[:page] )
    end
    if(params[:id])
      @article = Article.find(params[:id])
      @related =  @relationships - @article.relationships
      #@relationships = @relationships - @related
    end    
    respond_to do |format|  
      format.js
    end
  end  
  
end