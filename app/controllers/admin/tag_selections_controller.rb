class Admin::TagSelectionsController <  Admin::AdminController
  
  create.after :process_related, :process_sections
  update.after :process_related, :process_sections
  
  def index
    if(params[:search_tag_selections])
      @tag_selections = TagSelection.search params[:search_articles], :page => params[:page], :per_page => 10, :order => 'publish_date DESC'
    else
      @tag_selections = TagSelection.all( :order => 'publish_date DESC' ).paginate( :per_page => 10, :page => params[:page] )
    end
    render 'shared/admin/index.js.erb'
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
  
  def delete
    tag_selection = ThemeselectionTheme.find(params[:rel])
    tag_selection.destroy
    
    render :nothing => true
  end
    
  private 
  
    #def set_values
      #debugger
      #params[:article_banner][:publish_date] = params[:article_banner][:publish_date].split('/').reverse.join('-')
      #@tag_selection.update_attributes( :publish_date => params[:tag_selection][:publish_date].split('/').reverse.join('-')) 
    #end
    
    def process_sections
      @tag_selection.attributes = {'section_ids' => []}.merge(params[:tag_selection] || {})
    end
    
    def process_related
      #debugger
      if(params[:related_themes])
        params[:related_themes].each_value do |r|
          art = Theme.find(r)
          @tag_selection.themes << art
        end
      end
    end
  
end
