#handles ajax requests
class Web::AjaxController < Web::WebController
  layout false
  
  def update_readest
    begin_date = DateTime.parse(params[:begin_date])
    @type = params[:type]
    @readest = Article.all_readest(begin_date)
    
    render :update do |page|
      page.replace_html "in_readest",:partial=>"web/articles/readest",:collection=>@readest
      page.replace_html "readest_settings",:partial=>"web/articles/readest_menu"
    end
  end
end
