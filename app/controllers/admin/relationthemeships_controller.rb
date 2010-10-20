class Admin::RelationthemeshipsController < Admin::AdminController
  
  def delete
    #theme = Theme.find(params[:id])
    #@relationthemeship = theme.relationthemeships.find(params[:rel])
    #@relationthemeship.destroy

    article_theme = ArticleTheme.find(params[:rel])
    article_theme.destroy
    render :nothing => true
  end
  
  def index
    if(params[:search_relationthemeships])
      @relationthemeships = Theme.search params[:search_relationthemeships], :page => params[:page], :per_page => 20, :order => 'name ASC'
    else  
      @relationthemeships = Theme.all( :order => 'name ASC' ).paginate( :per_page => 20, :page => params[:page] )
    end
    if(params[:id])
      @relationthemeship = Theme.find(params[:id])
    end    
    respond_to do |format|  
      format.js
    end
  end  
  
end
