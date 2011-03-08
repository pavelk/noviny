class Web::SectionsController < Web::WebController
  layout "web/referendum"
  before_filter :set_last_id
  
  def test_proxy
    t = params[:sleep].to_i
    sleep(t)
    render :nothing=>true
  end
  
  def topics
    add_breadcrumb "Témata", topics_path
    render :layout=>"web/gallery"
  end
  
  def index
    redirect_to section_path(:name=>"vikend") and return if Web::Calendar.week?
    @section = Section.find(Section::HOME_SECTION_ID)
    set_common_variables(Section::HOME_SECTION_ID)
    @question = Dailyquestion.first_by_date
    @article_photo_show = true
  end
  
  def detail
    @section = Section.find(:first,:conditions=>["name LIKE ?",unpretty_name(params[:name])],:select=>"id,name")
    cookies[:section_id] = @section.id
    @html_title = @section.name
    set_default_variables
    add_breadcrumb @section.name, section_path(pretty_name(@section))
    render :action=>"holidays" and return if Web::Calendar.holidays?
    if @section.name == "Váš Hlas"
      redirect_to home_path and return unless set_question_variables
      render :action=>"vas-hlas", :layout=>"web/gallery" and return
    elsif @section.name == "Fórum"
      set_forum_variables
      render :action=>"forum", :layout=>"web/gallery" and return
    else
      render :action=>"#{@section.id}" and return
      render :action=>"detail" and return
    end
  end
  
  def subsection
    @subsection = Section.find(:first,:conditions=>["name LIKE ?",unpretty_name(params[:name])])
    @html_title = @subsection.name
    @section = @subsection.parent
    @article_photo_show = true
    set_default_variables
    @articles = Article.paginate(:all,
                             :conditions=>["article_sections.section_id = ? AND articles.approved = ? AND articles.visibility = ?",@subsection.id,true,false],
                             :joins=>[:sections],
                             :order=>"order_date DESC, priority_section DESC, order_time DESC",
                             :page=>params[:page],
                             :per_page=>10,
                             :include=>[:content_type, :author, :pictures],
                             :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")
    ign_arr = @articles.map{|a| a.id}.uniq                         
    @opinions = Article.middle_opinions(@section.id,12,ign_arr)
    @type = 1 #for partial readest menu
    @readest = Article.all_readest(Time.now-24.hours)
    add_breadcrumb @subsection.name, ""
  end
  
  def search
    time = Time.parse("2009-08-01")
    @text = params[:text].to_s
    if (@text.length < 3)
      render :layout=>"web/gallery" and return
    end
=begin    
    @articles = Article.search @text,
                                 :page=>params[:page],
                                 :per_page=>25,
                                 :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                 :conditions=>{:approved=>true,:visibility=>false,:publish_date=>(time).to_i..Time.now.to_i},
                                 :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex",
                                 :include=>[:content_type, :author, :pictures]
    add_breadcrumb "Vyhledávání", ""
    render :layout=>"web/gallery" and return
=end    
    @articles = Article.paginate(:all,
                                 :conditions=>["publish_date <= ? AND articles.approved = ? AND articles.visibility = ? AND (name LIKE ? OR perex LIKE ? OR text LIKE ?)",Time.now,true,false,"%#{@text}%","%#{@text}%","%#{@text}%"],
                                 :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                 :page=>params[:page],
                                 :per_page=>25,
                                 :include=>[:content_type, :author, :pictures],
                                 :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")
    add_breadcrumb "Vyhledávání", ""
    render :layout=>"web/gallery"
  end
  
protected
  def set_default_variables
    set_common_variables(@section.id)
    case @section.id
      when Section::NAZORY
        set_opinions_variables
      when Section::VIKEND
        @week =  true
        set_weekend_variables
      else
        set_non_opinion_variables(@section.id)
    end
    #set_common_variables(@section.id)
  end

  def set_opinions_variables
    @only_time = true
    @article_photo_show = true

      succ_date = DateTime.parse(params[:succ_date]) rescue nil
      prev_date = DateTime.parse(params[:prev_date]) rescue nil
      op = ""
      op += "publish_date < '#{succ_date.end_of_day.to_s(:db)}' AND " if succ_date
      op += "publish_date > '#{prev_date.beginning_of_day.to_s(:db)}' AND " if prev_date
      @all_opinions = Article.find(:all,
                                   :conditions=>["#{op}content_type_id IN (?) AND articles.approved = ? AND articles.visibility = ?",ContentType.opinion_types,true,false],
                                   :group=>"pub_date",
                                   :select=>"date(publish_date) as pub_date",
                                   :order=>"pub_date DESC, order_date DESC, priority_section DESC, order_time DESC")
  end
  
  def set_weekend_variables
    @only_time = true
    @sunday = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Web::Calendar.sunday_date
    
    if Web::Calendar.holidays?
      @holiday_articles = []
      curr_date = Time.now 
      while Web::Calendar.holidays?(curr_date)
        @holiday_articles << Article.find(:all,
                                        :conditions=>["article_sections.section_id = ? AND content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",Section::VIKEND,ContentType::ZPRAVA,curr_date.beginning_of_day,curr_date.end_of_day,Time.now,true,false],
                                        :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                        :joins=>[:sections],
                                        :include=>[:content_type, :author, :pictures],
                                        :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")
        curr_date -= 1.days                             
      end
      return
    end
         
    @saturday_articles = Article.find(:all,
                                      :conditions=>["article_sections.section_id = ? AND content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",Section::VIKEND,ContentType::ZPRAVA,(@sunday-1.days).beginning_of_day,(@sunday-1.days).end_of_day,Time.now,true,false],
                                      :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                      :joins=>[:sections],
                                      :include=>[:content_type, :author, :pictures],
                                      :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")                                
    if Web::Calendar.saturday? && @sunday > Time.now
      @only_saturday = true
      return
    end
    @sunday_articles = Article.find(:all,
                                    :conditions=>["article_sections.section_id = ? AND content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",Section::VIKEND,ContentType::ZPRAVA,@sunday.beginning_of_day,@sunday.end_of_day,Time.now,true,false],
                                    :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                    :joins=>[:sections],
                                    :include=>[:content_type, :author, :pictures],
                                    :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")                                  
  end
  
  def set_non_opinion_variables(section_id)
    per_page = 10
    ign_arr = [@headliner_box ? @headliner_box.article_id : 0]
    @articles = Article.paginate(:all,
                                 :conditions=>["article_sections.section_id = ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ? AND articles.id NOT IN (?) AND articles.content_type_id NOT IN (?)",section_id,Time.now,true,false,ign_arr,ContentType.author_types],
                                 :order=>"order_date DESC, priority_section DESC, order_time DESC",
                                 :joins=>[:sections],
                                 :page=>params[:page],
                                 :per_page=>per_page,
                                 :include=>[:content_type, :author, :pictures],
                                 :select=>"articles.id, articles.author_id, articles.content_type_id, articles.name, articles.perex, articles.order_date, articles.order_time, articles.publish_date")
  end
  
  def set_common_variables(section_id)
    # caching in view
    #@top_themes = @section.top_themes
    #@right_boxes = Article.right_boxes(section_id)

    @headliner_box = Article.headliner_box(section_id)
    @rel_articles = @headliner_box ? @headliner_box.articles : []
    @themes = @headliner_box ? @headliner_box.themes : []
    @dailyquestions = @headliner_box ? @headliner_box.dailyquestions : []
    arr = @rel_articles
    arr += [@headliner_box.article] if @headliner_box
    arr += @articles if @articles
    arr += @today_articles if @today_articles
    arr += @yesterday_articles if @yesterday_articles
    arr += @opinions if @opinions
    arr += @right_boxes if @right_boxes
    @ign_arr = arr.map{|a| a.id}.uniq
    @down_boxes, down_arr = Article.down_boxes(section_id,@ign_arr)
    @ign_arr += down_arr.map{|a| a.id}
  end
  
  def set_question_variables
    @question = params[:question_id] ? Dailyquestion.find_by_id_and_approved(params[:question_id],true) : Dailyquestion.last_active
    return false unless @question
    @question_image = @question.pictures.first
    @author_yes = @question.author_yes
    @author_no = @question.author_no
    @y_votes = @question.yes_votes_in_perc
    @n_votes = @question.no_votes_in_perc
    @whole_votes = @question.whole_votes
    @y_title = @question.yes_title_results
    @n_title = @question.no_title_results

    @opened_questions = Dailyquestion.opened(@question.id)
    @closed_questions = Dailyquestion.closed(@question.id, params[:page])
    
    @message_all = "Celkem #{@whole_votes} hlasů. Ano: #{@y_title}, Ne: #{@n_title}."
  end
  
  def set_forum_variables
    @section_id = params[:section_id].to_i
    @sel_section = Section.find_by_id(@section_id)
    @subsection_id = params[:subsection_id].to_i
    @tag_id = params[:tag_id].to_i
    @author_id = params[:author_id].to_i
    @web_user_id = params[:web_user_id].to_i
    joins = {:article=>[]}
    conds = []
    conds << "article_sections.section_id = #{@section_id}" if @section_id > 0
    conds = ["article_sections.section_id = #{@subsection_id}"] if @subsection_id > 0
    conds << "articles.author_id = #{@author_id}" if @author_id > 0
    conds << "article_comments.web_user_id = #{@web_user_id}" if @web_user_id > 0
    conds << "article_themes.theme_id = #{@tag_id}" if @tag_id > 0
    conds = conds.join(" AND ")
    joins[:article] << [:article_themes] if @tag_id > 0
    joins[:article] << [:article_sections] if @section_id > 0
    joins[:article] << [:author] if @subsection_id > 0
    @comments = ArticleComment.paginate(:all,:select=>"article_comments.*",
                :conditions=>[conds],
                :joins=>joins,
                :order=>"article_comments.created_at DESC",
                :group=>"article_comments.id",
                :per_page=>30,
                :page=>params[:page])
  end
end
