class Admin::RelationquestionshipsController < Admin::AdminController
  
  def delete
    #quest = Dailyquestion.find(params[:id])
    #@relationquestionship = quest.relationquestionships.find(params[:rel])
    #@relationquestionship.destroy
    #
    article_dailyquestion = ArticleDailyquestion.find(params[:rel])
    article_dailyquestion.destroy
    render :nothing => true
  end

  def index
    if(params[:search_relationquestionships])
      @relationquestionships = Dailyquestion.search params[:search_relationquestionships], :conditions => { :approved => 1 },  :page => params[:page], :per_page => 20, :order => 'updated_at DESC'
    else  
      @relationquestionships = Dailyquestion.all( :order => 'updated_at DESC', :conditions => "approved = true" ).paginate( :per_page => 20, :page => params[:page] )
    end
    if(params[:id])
      @relationquestionship = Dailyquestion.find(params[:id])
    end    
    respond_to do |format|  
      format.js
    end
  end  
  
end
