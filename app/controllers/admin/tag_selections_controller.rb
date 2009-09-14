class Admin::TagSelectionsController <  Admin::AdminController
  
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
      @tag_selection.update_attributes( :publish_date => params[:tag_selection][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      @tag_selection.attributes = {'section_ids' => []}.merge(params[:tag_selection] || {})
    end
  
end