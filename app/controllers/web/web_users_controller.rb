class Web::WebUsersController < Web::WebController
  layout "web/referendum"
  
  def info
    @info_user = WebUser.find(params[:id])
    @comments = @info_user.article_comments.paginate(:page=>params[:page],:per_page=>5)
    add_breadcrumb @info_user.full_name, ""
  end
end
