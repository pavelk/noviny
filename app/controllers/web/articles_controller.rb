class Web::ArticlesController < Web::WebController
  layout "web/gallery"
  
  def add_comment
    @article = Article.find(params[:id])
    @section = @article.section
    @author = @article.author
    @author_image = @author.pictures.first.data.url(:small) if @author && @author.pictures.first
    @article_image = @article.pictures.first
    
    @newest = Article.newest(@section.id)
    add_breadcrumb @article.section.name, ""
    if request.post?
      @comment = ArticleComment.new(params[:comment])
      @comment.user_id = 5
      @comment.created_at = Time.now
      if @comment.save
        redirect_to :action=>"detail", :id=>@article.id
      else
        render :action=>"detail_noimg" and return unless @article_image
        render :action=>"detail"
      end
    end
    
  end
  
  def detail
    @article = Article.find(params[:id])
    @related = @article.relarticles
    @section = @article.section
    @author = @article.author
    @author_image = @author.pictures.first.data.url(:small) if @author && @author.pictures.first
    @article_image = @article.pictures.first
    @comments = @article.article_comments
    @newest = Article.newest(@section.id)
    @info_box = @article.info_boxes.first
    
    add_breadcrumb @article.section.name, ""
    ArticleView.create(:article_id=>@article.id,:shown_date=>Time.now)
    render :action=>"detail_noimg" unless @article_image
  end
  
  def archiv
    datum = DateTime.strptime(params[:date],"%d.%m.%Y") rescue Time.now
    redirect_to home_path and return if datum > Time.now
    @date = datum.to_s(:cz_date)
    @articles = Article.all_by_date(datum,params[:page],10)
    add_breadcrumb "Vydání", ""
  end
  
  def topic
    @tag = Tag.find(params[:id])
    @newest = Article.newest
    @articles = Article.paginate_from_tag(@tag.id,params[:page])
    add_breadcrumb "Témata", ""                                 
  end
  
  def author_info
    @author = Author.find(params[:id])
    @articles = Article.paginate_from_author(@author.id,params[:page])
    @newest = Article.newest 
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
    @related = @article.relarticles
    @section = @article.section
    @author = @article.author
    @pictures = Picture.paginate_from_article(@article.id,params[:page])
    redirect_to :action=>"detail",:id=>params[:id] and return if @pictures.blank?
    @author_image = @author.pictures.first.data.url(:author_little) if @author && @author.pictures.first
    @article_image = @pictures.first
    @info_box = @article.info_boxes.first
    
    @newest = Article.newest(@section.id)
    
    add_breadcrumb @article.section.name, ""
    #render :layout=>"web/gallery"
  end
end
