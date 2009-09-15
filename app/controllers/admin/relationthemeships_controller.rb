class Admin::RelationthemeshipsController < Admin::AdminController
  
  def delete
    theme = Theme.find(params[:id])
    @relationthemeship = theme.relationthemeships.find(params[:rel])
    @relationthemeship.destroy
    render :nothing => true
  end
  
  def index
    if(params[:search_relationthemeships])
      @relationthemeships = Theme.search params[:search_relationthemeships], :page => params[:page], :per_page => 20
    else  
      @relationthemeships = Theme.all.paginate( :per_page => 20, :page => params[:page] )
    end
    if(params[:id])
      @relationthemeship = Theme.find(params[:id])
      #@related =  @relationthemeships - @relationthemeship.relationships
      #@relationships = @relationships - @related
    end    
    respond_to do |format|  
      format.js
    end
  end  
  
end