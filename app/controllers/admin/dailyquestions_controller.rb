class Admin::DailyquestionsController < Admin::AdminController
  
  create.after :set_values
  update.after :set_values
  
  def index
    #debugger
    if(params[:search_article_selections])
      @dailyquestions = Dailyquestion.search params[:search_daily_questions], :page => params[:page], :per_page => 20, :order => 'publish_date DESC'
    else  
      @dailyquestions = Dailyquestion.all( :order => 'publish_date DESC'  ).paginate( :per_page => 20, :page => params[:page] )
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
      #@dailyquestion.update_attributes( :publish_date => params[:publish_date].split('/').reverse.join('-'))
      @dailyquestion.update_attributes( :publish_date => params[:dailyquestion][:publish_date].split('/').reverse.join('-'))
    end
  
end
