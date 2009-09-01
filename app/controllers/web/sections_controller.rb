class Web::SectionsController < Web::WebController
  layout "web/referendum"
  
  def index
    @articles = Article.today_by_priority_home
    @opinions = Article.find(:all,
                             :conditions=>["section_id = ? AND priority_home > ? AND publish_date <= ?",Section::NAZORY,0,Time.now],
                             :order=>"priority_home DESC",
                             :include=>[:content_type])
                             
    @homes = Article.today_from_section(Section::DOMOV)
    @worlds = Article.today_from_section(Section::SVET)
    @arts = Article.today_from_section(Section::UMENI)
    @news = Article.today_top_news(10)
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
                             
    @homes = Article.today_from_section(Section::DOMOV)
    @worlds = Article.today_from_section(Section::SVET)
    @arts = Article.today_from_section(Section::UMENI)
    @news = Article.today_top_news(10)
    render :action=>"index"
  end
  
protected
  def set_default_variables
    set_common_variables(@section.id)
    case 
      when Section::NAZORY
        set_opinions_variables
      when Section::UMENI
        set_arts_variables
    end
  end

  def set_opinions_variables
    @yesterday_articles = Article.yesterday_from_section(Section::NAZORY)                             
                             
    @arts = Article.today_from_section(Section::UMENI)
    @news = Article.today_top_news(10)
  end
  
  def set_arts_variables
    @opinions = Article.today_top_opinions(9)
  end
  
  def set_common_variables(section_id)
    @today_articles = Article.today_from_section(section_id)
                             
    @first_article = @today_articles.first
    
    @articles = Article.today_by_priority_home
                             
    @homes = Article.today_from_section(Section::DOMOV)
    @worlds = Article.today_from_section(Section::SVET)                             
  end
end
