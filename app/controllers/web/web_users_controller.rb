class Web::WebUsersController < Web::WebController
  layout "web/gallery"
  
  def info
    @info_user = WebUser.find(params[:id])
    @comments = @info_user.article_comments.paginate(:page=>params[:page],:per_page=>5, :order => "created_at DESC")
    add_breadcrumb "Čtenář", ""
  end
end
