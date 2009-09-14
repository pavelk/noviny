#Not used for now...
class Web::RoutesController < Web::WebController
  
  def index
    name = params[:name].gsub('-',' ')
    section = Section.find_by_name_and_parent_id(name,nil)
    redirect_to :controller=>"web/sections",:action=>"detail",:name=>name and return if section
    sub_section = Section.find_by_name(name)
    redirect_to :controller=>"web/sections",:action=>"subsection",:name=>name and return if sub_section
  end
end
