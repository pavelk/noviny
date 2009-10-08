class Web::WebUsersController < Web::WebController
  layout "web/referendum"
  
  def info
    @web_user = WebUser.find(params[:id])
    @comments = @web_user.article_comments.paginate(:page=>params[:page],:per_page=>5)
    add_breadcrumb @web_user.full_name, ""
  end
end
