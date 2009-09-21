class Web::SectionsController < Web::WebController
  layout "web/referendum"
  
  def index
    if Web::Calendar.week?
      @articles = Article.find(:all,
                               :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ?",ContentType::ZPRAVA,Time.now.beginning_of_day,Time.now],
                               :order=>"publish_date DESC",
                               :include=>[:content_type])
    else
      @articles = Article.home_opinions(Time.now,Web::Calendar.set_opinion_limit)
    end
    set_common_variables(Section::HOME_SECTION_ID)
    @question = Dailyquestion.first_by_date
    @question_image = @question.pictures.first if @question
  end
  
  def detail
    @section = Section.find(params[:id])
    set_default_variables
    add_breadcrumb @section.name, ""
    render :action=>"#{@section.id}"
  end
  
  def subsection
    @subsection = Section.find(params[:id])
    @section = @subsection.parent
    set_default_variables
    @articles = Article.paginate(:all,
                             :conditions=>["subsection_id = ?",@subsection.id],
                             :order=>"publish_date DESC",
                             :page=>params[:page],
                             :per_page=>10)
                             
    @opinions = Article.today_top_opinions(9)
    @authors = Author.find(:all,:limit=>10)
    @type = 1 #for partial readest menu
    @readest = Article.all_readest(Time.now-24.hours)
    add_breadcrumb @subsection.name, ""
  end
  
  def search
    @text = params[:text]
    @articles = Article.paginate(:all,
                                 :conditions=>["publish_date <= ? AND name LIKE ? OR perex LIKE ? OR text LIKE ?",Time.now,"%#{@text}%","%#{@text}%","%#{@text}%"],
                                 :page=>params[:page],
                                 :per_page=>25)
    add_breadcrumb "Vyhledávání", ""
    render :layout=>"web/gallery"
  end
  
protected
  def set_default_variables
    case @section.id
      when Section::NAZORY
        set_opinions_variables
      when Section::VIKEND
        set_weekend_variables
      else
        set_non_opinion_variables(@section.id)
    end
    set_common_variables(@section.id)
  end

  def set_opinions_variables
    @today_articles = Article.from_section(:section_id=>Section::NAZORY,
                                           :from_date=>Time.now,
                                           :limit=>nil)
                                          
    @yesterday_articles = Article.from_section(:section_id=>Section::NAZORY,
                                               :from_date=>Time.now.yesterday,
                                               :limit=>nil)  
  end
  
  def set_weekend_variables
    @sunday = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Web::Calendar.sunday_date
    @sunday_articles = Article.find(:all,
                                    :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ?",ContentType::ZPRAVA,@sunday.beginning_of_day,@sunday.end_of_day],
                                    :order=>"publish_date DESC",
                                    :include=>[:content_type])
         
    @saturday_articles = Article.find(:all,
                                      :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ?",ContentType::ZPRAVA,(@sunday-1.days).beginning_of_day,(@sunday-1.days).end_of_day],
                                      :order=>"publish_date DESC",
                                      :include=>[:content_type])
  end
  
  def set_non_opinion_variables(section_id)
    per_page = 10
    @articles = Article.paginate(:all,
                                 :conditions=>["section_id = ? AND publish_date <= ?",section_id,Time.now],
                                 :order=>"priority_section DESC, publish_date DESC",
                                 :page=>params[:page],
                                 :per_page=>per_page)
    @opinions = Article.today_top_opinions(section_id,10)                                  
  end
  
  def set_common_variables(section_id)
    @headliner_box = Article.headliner_box(section_id)
    @rel_articles = @headliner_box ? @headliner_box.articles : []
    @right_boxes = Article.right_boxes(section_id)
    @news = Article.today_top_news if (section_id == Section::HOME_SECTION_ID || section_id == Section::NAZORY || section_id == Section::VIKEND)
    arr = @rel_articles
    arr += @news if @news
    arr += @opinions if @opinions
    ign_arr = arr.map{|a| a.id}
    @down_boxes = Article.down_boxes(section_id,ign_arr)
  end
end
