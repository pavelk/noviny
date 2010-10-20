class Web::TextPagesController < Web::WebController
  layout "web/part/text_page"
  before_filter :set_last_id, :except=>:error
  
  def show
    @text_page = TextPage.find(:first,:conditions=>["name LIKE ?",unpretty_name(params[:name])])
    render :action=>"error" and return unless @text_page
    #add_breadcrumb @text_page.name, ""
  end
  
  def hp_box
    @headliner_box = HeadlinerBox.find(params[:id])
    @rel_articles = @headliner_box ? @headliner_box.articles : []
    @themes = @headliner_box ? @headliner_box.themes : []
    @dailyquestions = @headliner_box ? @headliner_box.dailyquestions : []
    render :layout=>"web/part/hp_box"
  end
  
  def gp_box
    @gp = ArticleBanner.find(params[:id])
    render :layout=>"web/part/gp"
  end
  
  def error
    
  end
  
end
