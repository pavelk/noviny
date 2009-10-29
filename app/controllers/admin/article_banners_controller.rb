class Admin::ArticleBannersController < Admin::AdminController
  
  #create.before :set_values
  #update.before :set_values
  create.after :process_related, :set_values, :process_sections, :add_flash_photo
  update.after :process_related, :set_values, :process_sections, :add_flash_photo
  
  #index.response do |wants|
  #  wants.js
  #end
  def index
    if(params[:search_article_banners])
      @article_banners = ArticleBanner.search params[:search_article_banners]
    else
      @article_banners = ArticleBanner.all
    end 
    render 'shared/admin/index.js.erb'
  end
  
  def add_flash_image
    controlNull = FlashphotoBanner.find_by_sql("SELECT * FROM flashphoto_banners WHERE article_banner_id is NULL")
    if( controlNull.size > 0)
      controlNull[0].update_attributes(:photo => params[:Filedata])
      render :nothing => true
    elsif(params[:fid])
      exist = FlashphotoBanner.find(params[:fid])
      exist.update_attributes(:photo => params[:Filedata])
      render :nothing => true
    else  
      @fp = FlashphotoBanner.new(:photo => params[:Filedata])
      @fp.save!
      respond_to do |format|
        format.html { render :layout => false }
      end
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
  
  private 
  
    def add_flash_photo
    #debugger
      if(params[:flashimage_id])
        @fi = FlashphotoBanner.find(params[:flashimage_id])
        @article_banner.flashphoto_banners << @fi
      end  
    end
  
    def set_values
      #debugger
      @article_banner.update_attributes( :publish_date => params[:article_banner][:publish_date].split('/').reverse.join('-')) 
    end
    
    def process_sections
      @article_banner.attributes = {'section_ids' => []}.merge(params[:article_banner] || {})
    end
    
    def process_related
      if(params[:related_main])
        article_id = params[:related_main].shift[1]
        @article_banner.update_attributes( :article_id => article_id )
      end
    end  
  
end