class Web::TextPagesController < Web::WebController
  layout "web/referendum"
  
  def show
    @text_page = TextPage.find(params[:id])
    add_breadcrumb @text_page.name, ""
  end
  
end
