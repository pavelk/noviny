class Admin::DailyquestionsController < Admin::AdminController
  
  #create.before :set_author
  #create.after :process_adding_pictures, :set_values
  create.after :set_values, :process_related
  update.after :set_values, :process_related
  update.before :set_author

    
  def index
    #debugger
    if(params[:search_dailyquestions])
      @dailyquestions = Dailyquestion.search params[:search_dailyquestions], :page => params[:page], :per_page => 10, :order => 'publish_date DESC'
    else  
      @dailyquestions = Dailyquestion.all( :order => 'publish_date DESC'  ).paginate( :per_page => 10, :page => params[:page] )
    end   
    render 'shared/admin/index.js.erb'
  end
  
  #def new
  #  @dailyquestion = Dailyquestion.new
  #  2.times { @dailyquestion.dailyquestion_authors.build }
  #end
      
  new_action.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  #create.response do |wants|
  #  wants.js { render :layout => false }
  #end
  
  def add_img
    @dailyquestion = Dailyquestion.find(params[:art])
    @picture = Picture.find(params[:pic])
    @dailyquestion.pictures << @picture

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_img
    @dailyquestion = Dailyquestion.find(params[:art])
    @picture = Picture.find(params[:pic])
    @dailyquestion.pictures.delete(@picture)

    respond_to do |format|  
      format.js
    end 
  end
  
  def create
    params[:dailyquestion][:author_yes] = Author.find(params[:dailyquestion][:author_yes])
    params[:dailyquestion][:author_no] = Author.find(params[:dailyquestion][:author_no])
    @dailyquestion = Dailyquestion.new(params[:dailyquestion])
    process_adding_pictures
    set_values
    respond_to do |format|
      if @dailyquestion.save
        format.js
      end
    end
  end
  
  def get_reldailyquestions
    #debugger
    @dailyquestions = Dailyquestion.all(:conditions => "id in (#{params[:related_question].values.join(',')})") 
    
    respond_to do |format|  
      format.js
    end
  end

  private
  
    def set_author
      #debugger
      params[:dailyquestion][:author_yes] = Author.find(params[:dailyquestion][:author_yes])
      params[:dailyquestion][:author_no] = Author.find(params[:dailyquestion][:author_no])
    end  
  
    def process_adding_pictures
      if(params[:pictures])
        params[:pictures].each_value do |p|
          pict = Picture.find(p)
          @dailyquestion.pictures << pict
        end
      end      
    end
  
  
    def set_values
      #@dailyquestion.update_attributes( :publish_date => params[:dailyquestion][:publish_date].split('/').reverse.join('-'))
      if(params[:publish_time].size == 0)
        p_time = ' 04:00:00'
      else
        p_time = ' ' + params[:publish_time] + ':00'
      end    
      @dailyquestion.update_attributes( :publish_date => params[:publish_date].split('/').reverse.join('-') + p_time)
    end
  
    def process_related
      puts "!!!!!!!!!!!!!!!!!!!!!!!!"
      if(params[:related_question])
        params[:related_question].each_value do |r|
          relationquestionship = @dailyquestion.relationquestionships.build(:relquestion_id => r)
          relationquestionship.save
        end
      end  
    end

end
