class Web::TextPagesController < Web::WebController
  layout "web/part/text_page"
  
  def show
    @text_page = TextPage.find(params[:id])
    add_breadcrumb @text_page.name, ""
  end
  
  def hp_box
    @headliner_box = HeadlinerBox.find(params[:id])
    @rel_articles = @headliner_box ? @headliner_box.articles : []
    @themes = @headliner_box ? @headliner_box.themes : []
    render :layout=>"web/part/hp_box"
  end
  
  def gp_box
    @gp = ArticleBanner.find(params[:id])
    render :layout=>"web/part/gp"
  end
  
end
