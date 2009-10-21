class Admin::HeadlinerBoxesController < Admin::AdminController
  
  create.after :process_related, :set_values, :process_sections, :add_flash_photo
  update.after :process_related, :set_values, :process_sections, :add_flash_photo
  #create.after :set_values, :process_sections
  #update.after :set_values, :process_sections
  
  def index
    if(params[:search_headliner_boxes])
      @headliner_boxes = HeadlinerBox.search params[:search_headliner_boxes], :page => params[:page], :per_page => 10, :order => 'publish_date DESC'
    else
      @headliner_boxes = HeadlinerBox.all( :order => 'publish_date DESC' ).paginate( :per_page => 10, :page => params[:page] )
    end
    render 'shared/admin/index.js.erb'
  end
  
  def add_flash_image
    #debugger
    @fp = FlashphotoHeadliner.new(:photo => params[:Filedata])
    @fp.save!
    #render :nothing => true
    respond_to do |format|
      format.html { render :layout => false }
    end
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
    headliner_article = HeadlinerArticle.find(params[:rel])
    headliner_article.destroy
    
    render :nothing => true
  end
  
  private
    
    def add_flash_photo
      #debugger
      if(params[:flashimage_id])
        @fi = FlashphotoHeadliner.find(params[:flashimage_id])
        @headliner_box.flashphoto_headliners << @fi
      end  
    end  
  
    def process_related
      if(params[:related_sidebar])
        params[:related_sidebar].each_value do |r|
          art = Article.find(r)
          @headliner_box.articles << art
        end
      end
      if(params[:related_themes])
        params[:related_themes].each_value do |r|
          theme = Theme.find(r)
          @headliner_box.themes << theme
        end
      end
      if(params[:related_main])
        article_id = params[:related_main].shift[1]
        @headliner_box.update_attributes( :article_id => article_id )
      end
    end
  
    def set_values
      #debugger
      #params[:article_banner][:publish_date] = params[:article_banner][:publish_date].split('/').reverse.join('-')
      @headliner_box.update_attributes( :publish_date => params[:headliner_box][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      #debugger
      @headliner_box.attributes = {'section_ids' => []}.merge(params[:headliner_box] || {})
    end
  
end
