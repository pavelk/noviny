#handles ajax requests
class Web::AjaxController < Web::WebController
  layout false
  
  def update_subsections
    if request.xhr?
      @sel_section = Section.find_by_id(params[:section_id])
    end
  end
  
  def choose_author
    name = params[:name]
    @authors = Author.find(:all,:conditions=>["email LIKE ? OR surname LIKE ? OR firstname LIKE ?","%#{name}%","%#{name}%","%#{name}%"])
    render :layout => false
  end
  
  def update_readest
    begin_date = DateTime.parse(params[:begin_date])
    @type = params[:type].to_i
    section_id = params[:section_id] ? params[:section_id].to_i : nil
    section_id = nil if (section_id && !(1..4).include?(section_id))
    @readest = Article.all_readest(begin_date, @type, section_id)
    @section = Section.find(section_id) if section_id
    
    render :update do |page|
      page.replace_html "in_readest",:partial=>"web/articles/readest",:collection=>@readest
      page.replace_html "readest_settings",:partial=>"web/articles/readest_menu"
    end
  end
  
  def update_discuss
    begin_date = DateTime.parse(params[:begin_date])
    @dtype = params[:dtype].to_i
    section_id = params[:section_id] ? params[:section_id].to_i : nil
    @discussed = Article.discussed(begin_date, @dtype)
    @section = Section.find(section_id) if section_id
    
    render :update do |page|
      page.replace_html "in_discuss",:partial=>"web/articles/readest",:collection=>@discussed
      page.replace_html "discuss_settings",:partial=>"web/articles/discuss_menu"
    end
  end
end
