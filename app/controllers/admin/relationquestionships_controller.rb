class Admin::RelationquestionshipsController < Admin::AdminController
  
  def delete
    quest = Dailyquestion.find(params[:id])
    @relationquestionship = quest.relationquestionships.find(params[:rel])
    @relationquestionship.destroy
    render :nothing => true
  end
  
  def index
    if(params[:search_relationquestionships])
      @relationquestionships = Dailyquestion.search params[:search_relationquestionships], :page => params[:page], :per_page => 20, :order => 'updated_at DESC'
    else  
      @relationquestionships = Dailyquestion.all( :order => 'updated_at DESC' ).paginate( :per_page => 20, :page => params[:page] )
    end
    if(params[:id])
      @relationquestionship = Dailyquestion.find(params[:id])
    end    
    respond_to do |format|  
      format.js
    end
  end  
  
end
