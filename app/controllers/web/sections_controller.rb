class Web::SectionsController < Web::WebController
  layout "web/referendum"
  
  def old
      require 'rubygems'
      require "soap/rpc/driver"
      require 'http-access2'
      XSD::Charset.encoding = 'UTF8'
      
      client = SOAP::RPC::Driver.new("https://testgateway.paysec.csob.cz/testgateway/shoppingservice.svc?wsdl","http://schemas.mapi.paysec.cz/2008/02")
      client.options[ "protocol.http.ssl_config.verify_mode" ] = OpenSSL::SSL::VERIFY_NONE
      #client.soapaction = "http://schemas.mapi.paysec.cz/2008/02/ShoppingService/VerifyTransactionIsPaid"
      client.add_method("VerifyTransactionIsPaid", "userName","password","merchantOrderId","amount")
      rate =  client.VerifyTransactionIsPaid("denikreferendum","MapForYou04","asasasasdasdasd","22.0")
      puts "Rate: #{rate}"
   return
  end
  
  def test_paysec
  end
  
  def index
    redirect_to :controller=>"sections",:action=>"detail",:id=>Section::VIKEND and return if Web::Calendar.week?
    @section = Section.find(Section::HOME_SECTION_ID)
    set_common_variables(Section::HOME_SECTION_ID)
    ign_arr = [@headliner_box ? @headliner_box.article_id : 0]
    #if Web::Calendar.week?
    #  @articles = Article.find(:all,
    #                           :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",ContentType::ZPRAVA,Time.now.beginning_of_day,Time.now,true,true],
    #                           :order=>"publish_date DESC",
    #                           :include=>[:content_type])
    #else
      @today_opinions = Article.home_opinions(Time.now,Time.now,{:limit=>1,:ignore_arr=>ign_arr,:length_limit=>nil})
      if @today_opinions.length < 5
        @older_opinions = Article.home_opinions(Time.now.yesterday,Time.now.yesterday,{:limit=>20,:ignore_arr=>ign_arr,:length_limit=>5-@today_opinions.length})
      end
    #end
    @question = Dailyquestion.first_by_date
    #@question_image = @question.pictures.first if @question
    @article_photo_show = true
  end
  
  def detail
    cookies[:section_id] = params[:id]
    @section = Section.find(params[:id])
    set_default_variables
    add_breadcrumb @section.name, sections_path(:action=>"detail",:id=>@section.id)
    render :action=>"#{@section.id}"
  end
  
  def subsection
    @subsection = Section.find(params[:id])
    @section = @subsection.parent
    @article_photo_show = true
    set_default_variables
    @articles = Article.paginate(:all,
                             :conditions=>["article_sections.section_id = ? AND articles.approved = ? AND articles.visibility = ?",@subsection.id,true,false],
                             :joins=>[:article_sections],
                             :order=>"order_date DESC",
                             :page=>params[:page],
                             :per_page=>10)
                             
    @opinions = Article.today_top_opinions(9)
    @authors = Author.all_right
    @type = 1 #for partial readest menu
    @readest = Article.all_readest(Time.now-24.hours)
    add_breadcrumb @subsection.name, ""
  end
  
  def search
    @text = params[:text]
    @articles = Article.paginate(:all,
                                 :conditions=>["publish_date <= ? AND articles.approved = ? AND articles.visibility = ? AND name LIKE ? OR perex LIKE ? OR text LIKE ?",Time.now,true,true,"%#{@text}%","%#{@text}%","%#{@text}%"],
                                 :page=>params[:page],
                                 :per_page=>25)
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
    @article_photo_show = true
    if Web::Calendar.week? && Web::Calendar.sunday?
      tfrom_date = Time.now - 1.days
      tto_date = Time.now
      yfrom_date = Time.now.yesterday - 2.days
      yto_date = Time.now.yesterday - 2.days
    else
      tfrom_date = Time.now
      tto_date = Time.now
      yfrom_date = Time.now.yesterday
      yto_date = Time.now.yesterday
    end
    
    @today_articles = Article.from_section(:section_id=>Section::NAZORY,
                                           :from_date=>tfrom_date,
                                           :to_date => tto_date,
                                           :limit=>nil)
                                          
    @yesterday_articles = Article.from_section(:section_id=>Section::NAZORY,
                                               :from_date=>yfrom_date,
                                               :to_date => yto_date,
                                               :limit=>nil)  
  end
  
  def set_weekend_variables
    @sunday = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Web::Calendar.sunday_date
         
    @saturday_articles = Article.find(:all,
                                      :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",ContentType::ZPRAVA,(@sunday-1.days).beginning_of_day,(@sunday-1.days).end_of_day,Time.now,true,false],
                                      :order=>"order_date DESC",
                                      :include=>[:content_type])
    if Web::Calendar.saturday? && @sunday > Time.now
      @only_saturday = true
      return
    end
    @sunday_articles = Article.find(:all,
                                    :conditions=>["content_type_id != ? AND publish_date >= ? AND publish_date <= ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ?",ContentType::ZPRAVA,@sunday.beginning_of_day,@sunday.end_of_day,Time.now,true,false],
                                    :order=>"order_date DESC",
                                    :include=>[:content_type])                                  
  end
  
  def set_non_opinion_variables(section_id)
    per_page = 10
    ign_arr = [@headliner_box ? @headliner_box.article_id : 0]
    @articles = Article.paginate(:all,
                                 :conditions=>["article_sections.section_id = ? AND publish_date <= ? AND articles.approved = ? AND articles.visibility = ? AND articles.id NOT IN (?)",section_id,Time.now,true,false,ign_arr],
                                 :order=>"priority_section DESC, order_date DESC",
                                 :joins=>[:article_sections],
                                 :page=>params[:page],
                                 :per_page=>per_page)
    @opinions = Article.today_top_opinions(section_id,10,ign_arr)                                  
  end
  
  def set_common_variables(section_id)
    @top_themes = @section.top_themes
    @headliner_box = Article.headliner_box(section_id)
    @rel_articles = @headliner_box ? @headliner_box.articles : []
    @themes = @headliner_box ? @headliner_box.themes : []
    @right_boxes = Article.right_boxes(section_id)
    arr = @rel_articles
    arr += [@headliner_box.article] if @headliner_box
    arr += @articles if @articles
    arr += @today_articles if @today_articles
    arr += @yesterday_articles if @yesterday_articles
    arr += @opinions if @opinions
    arr += @right_boxes if @right_boxes
    ign_arr = arr.map{|a| a.id}.uniq
    @news = Article.today_top_news(10,ign_arr) if (section_id == Section::HOME_SECTION_ID || section_id == Section::NAZORY || section_id == Section::VIKEND)
    @down_boxes = Article.down_boxes(section_id,ign_arr)
  end
end
