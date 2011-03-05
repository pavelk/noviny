class Web::WebUsersController < Web::WebController
  layout "web/gallery"

  def info
    name_id = params[:id].gsub(/-.*$/,"")
    @info_user = WebUser.find_by_id(name_id)
    if @info_user
      @comments = @info_user.article_comments.paginate(:page=>params[:page],:per_page=>5, :order => "created_at DESC")
    else
      redirect_to :controller => 'web/text_pages', :action => 'error'
    end
    add_breadcrumb "Čtenář", ""
  end
end
