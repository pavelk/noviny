require "date"
class Web::ArticlesController < Web::WebController
  layout :set_layout, :except=>[:vote]
  before_filter :authorize_users_only, :only=>[:add_comment,:delete_comment]
  before_filter :set_last_id, :except=>:detail
  
  def download_audio
    audio = Audio.find(params[:id])
    send_file("#{RAILS_ROOT}/public#{audio.data.url}",:filename=>audio.data_file_name,:disposition=>"attachment",:type=>audio.data.type)
  end
  
  def download_inset
    inset = Inset.find(params[:id])
    send_file("#{RAILS_ROOT}/public#{inset.data.url}",:filename=>inset.data_file_name,:disposition=>"attachment",:type=>inset.data.type)
  end
  
  def send_by_email
    if request.post?
      email = params[:email]
      article = Article.find(params[:id])
      firstname = params[:firstname]
      lastname = params[:lastname]
      begin
        Notification.deliver_article(article, email, detail_article_url(pretty_id(article)), firstname, lastname)
        flash[:notice] = "Článek byl úspěšně poslán na #{email}"
      rescue
        flash[:error] = "Článek nebyl poslán kvůli chybě."
      end
      redirect_to detail_article_path(pretty_id(article))
    end
  end
  
  def authors
    @authors = Author.all(:order=>"surname",:select=>"authors.id,authors.surname,authors.firstname", :joins=>[:articles], :group=>"authors.id")
  end
  
  def add_comment
    @article = Article.find(params[:id], :include=>[:sections, :author, :article_comments])
    if request.get?
      redirect_to :action=>"detail", :id=>@article.id  and return
    end
    @section = @article.section
    @author = @article.author
    @author_image = @author.pictures.first.data.url(:author_little) if @author && @author.pictures.first
    @article_image = @article.pictures.first
    @comments = @article.article_comments
    
    add_breadcrumb @article.section.name, ""
    if request.post?
      @comment = ArticleComment.new(params[:comment])
      if @comment.save
        redirect_to detail_article_path(pretty_id(@article))
      else
        render :action=>"detail_noimg" and return unless @article_image
        render :action=>"detail"
      end
    end
  end
  
  def delete_comment
    com = ArticleComment.find(params[:id])
    redirect_to home_path and return if !(@web_user && @web_user.can_modify?(com))
    com.destroy
    redirect_to detail_article_path(pretty_id(com.article))
  end
  
  def detail
    @article = Article.find_by_id(params[:id],:include=>[:sections,:themes,:relarticles,:inverse_relarticles, :author, :pictures, :article_comments, :info_boxes])
    redirect_to home_path and return unless @article
    cookies[:last_article_id] = @article.id
    
    set_detail_variables
    @article_image = @article.pictures.first

    sections = @article.sections
    if (cookies[:section_id] && sections.include?(Section.find(cookies[:section_id])))
      @section = Section.find(cookies[:section_id])
    end
    
    @comments = @article.article_comments
     
    ArticleView.create(:article_id=>@article.id,:shown_date=>Time.now)
    render :action=>"detail_noimg" if (!@article_image && !@article.content_type.video?)
  end
  
  def vote
    if request.xhr?
      remote_ip = request.env['HTTP_X_FORWARDED_FOR'] || request.remote_ip
      @question = Dailyquestion.find(:first,:conditions=>["id = ? AND publish_date BETWEEN ? AND ?",params[:question_id],Time.now-7.days,Time.now])
      render :nothing=>true and return unless @question
      if cookies["question_id_#{Time.now.to_date}"] &&  cookies["question_id_#{Time.now.to_date}"].split(';').include?(@question.id.to_s)
        render :nothing=>true and return
      elsif !cookies["question_id_#{Time.now.to_date}"].blank?
        cookies["question_id_#{Time.now.to_date}"] = {
          :value => cookies["question_id_#{Time.now.to_date}"] + ";#{@question.id}",
          :expires => 1.days.from_now
        }
      else
        cookies["question_id_#{Time.now.to_date}"] = {
          :value => "#{@question.id}",
          :expires => 1.days.from_now
        }
      end
      @vote_value = params[:vote_value].to_i != 0
      qvs = QuestionVote.count(:conditions=>{:question_id=>@question.id,:ipaddr=>remote_ip,:created_at=>Time.now.beginning_of_day..Time.now.end_of_day})
      if qvs >= 50
        @message = "Tato IP adresa hlasovala již padesátkrát."
        render :update do |page|
          page.replace_html "message-#{@question.id}", @message
        end
      else
        qv = QuestionVote.new(:question_id=>@question.id,:vote_value=>@vote_value)
        qv.ipaddr = remote_ip
        qv.web_user_id = @web_user.id if @web_user
        qv.save
        @question.question_votes << qv
        
        whole_votes = QuestionVote.count(:conditions=>{:question_id=>@question.id})
        if whole_votes > 0
          @y_votes = (QuestionVote.count(:conditions=>{:question_id=>@question.id,:vote_value=>true}).to_f/whole_votes.to_f) * 100
        else
          @y_votes = 0
        end
        @n_votes = 100 - @y_votes
        @message = "Hlasoval jste #{(@vote_value == true) ? 'Ano' : 'Ne'}, celkem #{(@vote_value == true) ? @y_votes.to_i : @n_votes.to_i}%"
        render :update do |page|
          page.replace_html "question-#{@question.id}", :partial=>"web/articles/question_vote"
        end
      end
    end
    return
  end
  
  def question
    @question = Dailyquestion.find_by_id_and_approved(params[:id],true)
    redirect_to home_path and return unless @question
    @question_image = @question.pictures.first
    @author_yes = @question.author_yes
    @author_no = @question.author_no
    whole_votes = QuestionVote.count(:conditions=>{:question_id=>@question.id})
    if whole_votes > 0
      @y_votes = (QuestionVote.count(:conditions=>{:question_id=>@question.id,:vote_value=>true}).to_f/whole_votes.to_f) * 100
      @n_votes = 100 - @y_votes
    else
      @y_votes = 0
      @n_votes = 0
    end
    
    add_breadcrumb "Otázka", ""
  end
  
  def archiv
    @only_time = true
    @article_photo_show = true
    if params[:range]
      datum = Date.civil(params[:range][:"publish_date(1i)"].to_i,params[:range][:"publish_date(2i)"].to_i,params[:range][:"publish_date(3i)"].to_i).to_time rescue Time.now
    else
      datum = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Time.now
    end
    redirect_to home_path and return if datum > Time.now
    @date = datum.to_s(:cz_date)
    @opinions = Article.all_by_date(datum,nil,ContentType.opinion_types)
    ign_arr = @opinions.map{|a| a.id}
    @homes = Article.all_by_date(datum,Section::DOMOV,ContentType.message_types,ign_arr)
    ign_arr += @homes.map{|a| a.id}
    @worlds = Article.all_by_date(datum,Section::SVET,ContentType.message_types,ign_arr)
    ign_arr += @worlds.map{|a| a.id}
    @arts = Article.all_by_date(datum,Section::UMENI,ContentType.message_types,ign_arr)
    ign_arr += @arts.map{|a| a.id}
    @next_pages = Article.all_by_date(datum,nil,ContentType.other_types,ign_arr)
    @question = Dailyquestion.first_by_date(datum)
    @range = Article.new(:publish_date=>datum)
    
    add_breadcrumb "Vydání", ""
  end
  
  def topic
    @article_photo_show = true
    if cookies[:section_id]
      @section = Section.find(cookies[:section_id])
    else
      @section = Section.find(Section::HOME_SECTION_ID)
    end
    @top_themes = @section.top_themes
    @tag = Theme.find(:first,:conditions=>["name LIKE ?",unpretty_name(params[:name])])
    @html_title = @tag.name
    @articles = Article.paginate_from_tag(@tag.id,params[:page])
    @next_topics = @tag.relthemes + @tag.inverse_relthemes
    add_breadcrumb "Témata", ""                                 
  end
  
  def author_info
    name = params[:name]
    first,last = name.split("-",2)
    @author = Author.find(:first,:conditions=>["firstname LIKE ? AND surname LIKE ?","#{first}%","#{last}%"])
    @articles = Article.paginate_from_author(@author.id,params[:page])
    @author_image = @author.pictures.first
    add_breadcrumb "Autor", ""
  end
  
  def update_thumb
    @page = params[:page].to_i
    @article = Article.find(params[:article_id])
    @pictures = Picture.paginate_from_article(@article.id,params[:page])
    render :update do |page|
      page.replace_html "thumbs", :partial=>"web/articles/thumb", :collection=>@pictures
      page.replace_html "paging", :partial=>"web/articles/paging"
    end
  end
  
  def change_main_image
    @article_image = Picture.find(params[:id])
    render :update do |page|
      page.replace_html "main_image", :partial=>"web/articles/main_image"
    end
  end
  
  def detail_gallery
    @page = 1
    @article = Article.find_by_id(params[:id],:include=>[:sections,:themes,:relarticles,:inverse_relarticles, :author, :pictures, :article_comments, :info_boxes])
    set_detail_variables
    @pictures = Picture.paginate_from_article(@article.id,params[:page])
    @article_image = @pictures.first
    redirect_to :action=>"detail",:id=>params[:id] and return if @pictures.blank?
  end
  
protected
  def set_detail_variables
    @section = @article.section
    @meta_description = @article.perex
    @html_title = @article.opinion_name
    @related = @article.relarticles + @article.inverse_relarticles
    @author = @article.author
    @top_themes = @article.themes
    @info_box = @article.info_boxes.first
    @author_image = @author.pictures.first.data.url(:author_little) if @author && @author.pictures.first
    
    if @article.content_type_id == ContentType::VIDEO
      @older_videos = Article.all(:conditions=>["content_type_id = ? AND order_date >= ? AND order_date <= ?",ContentType::VIDEO,@article.order_date - 14.days,@article.order_date - 1.days],:order=>"order_date DESC")
    end
    
    if @section
       add_breadcrumb @section.name, section_path(pretty_name(@section))
     else
       add_breadcrumb "Detail", ""
    end
  end

  def set_layout
    @printable ? "web/print" : "web/gallery"
  end

  def authorize_users_only
    require_auth 'USERS'
  end
end
