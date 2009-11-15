require "date"
class Web::ArticlesController < Web::WebController
  layout "web/gallery", :except=>[:vote]
  before_filter :authorize_users_only, :only=>[:add_comment,:delete_comment]
  
  def authors
    @authors = Author.all(:order=>"surname")
  end
  
  def add_comment
    @article = Article.find(params[:id])
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
        redirect_to :action=>"detail", :id=>@article.id
      else
        render :action=>"detail_noimg" and return unless @article_image
        render :action=>"detail"
      end
    end
  end
  
  def delete_comment
    com = ArticleComment.find(params[:id])
    com.destroy
    redirect_to :action=>"detail", :id=>com.article_id
  end
  
  def detail
    @article = Article.find(params[:id])
    @related = @article.relarticles + @article.inverse_relarticles
    @newest = Article.newest(3,@article.id)
    @section = @article.section
    sections = @article.sections
    if (cookies[:section_id] && sections.include?(Section.find(cookies[:section_id])))
      @section = Section.find(cookies[:section_id])
    end
    @top_themes = @article.themes
    @author = @article.author
    @author_image = @author.pictures.first.data.url(:author_little) if @author && @author.pictures.first
    @article_image = @article.pictures.first
    @comments = @article.article_comments
    @info_box = @article.info_boxes.first
    
     if @section
       add_breadcrumb @section.name, section_path(pretty_name(@section))
     else
       add_breadcrumb "Detail", ""
     end
   
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
        @message = "Hlasoval jste #{(@vote_value == true) ? 'Ano' : 'Ne'} jako #{@question.question_votes.count} hlas"
        render :update do |page|
          page.replace_html "question-#{@question.id}", :partial=>"web/articles/question_vote"
        end
      end
    end
    return
  end
  
  def question
    @question = Dailyquestion.find(params[:id])
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
    @article_photo_show = true
    datum = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Time.now
    puts params[:date]
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
    @articles = Article.paginate_from_tag(@tag.id,params[:page])
    @next_topics = @tag.relthemes
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
    @article = Article.find(params[:id])
    @related = @article.relarticles + @article.inverse_relarticles
    @top_themes = @article.themes
    @section = @article.section
    @author = @article.author
    @pictures = Picture.paginate_from_article(@article.id,params[:page])
    redirect_to :action=>"detail",:id=>params[:id] and return if @pictures.blank?
    @author_image = @author.pictures.first.data.url(:author_little) if @author && @author.pictures.first
    @article_image = @pictures.first
    @info_box = @article.info_boxes.first
    @newest = Article.newest(3,@article.id)
    
    if @section
       add_breadcrumb @section.name, section_path(pretty_name(@section))
     else
       add_breadcrumb "Detail", ""
     end
    #render :layout=>"web/gallery"
  end
protected
  def authorize_users_only
    require_auth 'USERS'
  end
end
