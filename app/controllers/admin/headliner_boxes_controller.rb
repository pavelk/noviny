class Admin::HeadlinerBoxesController < Admin::AdminController
  
  create.after :set_values, :process_sections
  update.after :set_values, :process_sections
  
  index.response do |wants|
    wants.js
  end
  
  new_action.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  create.response do |wants|
    wants.js { render :layout => false }
  end
  
  private 
  
    def set_values
      #debugger
      #params[:article_banner][:publish_date] = params[:article_banner][:publish_date].split('/').reverse.join('-')
      @headliner_box.update_attributes( :publish_date => params[:headliner_box][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      debugger
      @headliner_box.attributes = {'section_ids' => []}.merge(params[:headliner_box] || {})
    end
  
end
