class Web::SectionsController < Web::WebController
  layout "web/referendum"
  
  def index
    set_common_variables(0)
    @opinions = Article.home_opinions
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
    @articles = Article.find(:all,:conditions=>["publish_date <= ? AND name LIKE ? OR perex LIKE ? OR text LIKE ?","%#{@text}%","%#{@text}%","%#{@text}%",Time.now])
    @opinions = Article.find(:all,
                             :conditions=>["section_id = ? AND priority_home > ? AND publish_date <= ?",Section::NAZORY,0,Time.now],
                             :order=>"priority_home DESC",
                             :include=>[:content_type])
                             
    @homes = Article.from_section(:section_id=>Section::DOMOV)
    @worlds = Article.from_section(:section_id=>Section::SVET)
    @arts = Article.from_section(:section_id=>Section::UMENI)
    render :action=>"index"
  end
  
protected
  def set_default_variables
    set_common_variables(@section.id)
    case @section.id
      when Section::NAZORY
        set_opinions_variables
      when Section::VIKEND
        set_weekend_variables
      else
        set_non_opinion_variables(@section.id)
    end
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
    @sunday_articles = Article.from_section(:section_id=>Section::VIKEND,
                                            :from_date=>Web::Calendar.sunday_date,
                                            :limit=>nil)
    @saturday_articles = Article.from_section(:section_id=>Section::VIKEND,
                                              :from_date=>Web::Calendar.saturday_date,
                                              :limit=>nil)                                        
  end
  
  def set_non_opinion_variables(section_id)
    per_page = 10
    @articles = Article.paginate(:all,
                                 :conditions=>["section_id = ? AND publish_date <= ?",section_id,Time.now],
                                 :order=>"priority_section DESC, publish_date DESC",
                                 :page=>params[:page],
                                 :per_page=>per_page)
    @opinions = Article.today_top_opinions(10)                                  
    ign_arr = (@rel_articles + @news + @opinions).map{|a| a.id}                                  
    @down_opinions = Article.from_section(:section_id=>Section::NAZORY,:ignore_arr=>ign_arr)
  end
  
  def set_common_variables(section_id)
    @headliner_box = Article.headliner_box(section_id)
    @rel_articles = @headliner_box ? @headliner_box.article.relarticles : []
    @right_boxes = Article.right_boxes([],section_id)
    @news = Article.today_top_news(10)
    
    ign_arr = (@rel_articles + @news).map{|a| a.id}
    @homes = Article.from_section(:section_id=>Section::DOMOV,:ignore_arr=>ign_arr)
    @worlds = Article.from_section(:section_id=>Section::SVET,:ignore_arr=>ign_arr)
    @arts = Article.from_section(:section_id=>Section::UMENI,:ignore_arr=>ign_arr)
  end
end
