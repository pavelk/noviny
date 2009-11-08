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
      @article_banners = ArticleBanner.search params[:search_article_banners], :page => params[:page], :per_page => 10, :order => 'publish_date DESC'
    else
      @article_banners = ArticleBanner.all( :order => 'publish_date DESC' ).paginate( :per_page => 10, :page => params[:page] )
    end 
    render 'shared/admin/index.js.erb'
  end
  
  def add_flash_image
    if( params[:fnid] )
      nexist =  FlashphotoBanner.find(params[:fnid])
      nexist.update_attributes(:photo => params[:Filedata]) 
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
      
       if(@article_banner.articlebanner_sections.size > 0)
       ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_section = priority_section - 1 
                                              WHERE priority_section <= #{@article_banner.priority_section} 
                                              && priority_section > 1 
                                              && publish_date LIKE '%#{@article_banner.publish_date.strftime("%Y-%m-%d").to_s}%'
                                              && id <> #{@article_banner.id}
                                              && id IN ( SELECT article_banner_id FROM articlebanner_sections WHERE section_id IN (#{@article_banner.articlebanner_sections.collect {|f| f.section_id }.join(',')}) )"                                      
       ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_home = priority_home - 1 
                                              WHERE priority_home <= #{@article_banner.priority_home} 
                                              && priority_home > 1 
                                              && publish_date LIKE '%#{@article_banner.publish_date.strftime("%Y-%m-%d").to_s}%'
                                              && id <> #{@article_banner.id} 
                                              && id IN ( SELECT article_banner_id FROM articlebanner_sections WHERE section_id = 9999 )"

       ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_section = 1 
                                              WHERE priority_section > 1
                                              && publish_date < current_date()"

      ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_home = 1 
                                             WHERE priority_home > 1
                                             && publish_date < current_date()"                                       

       end
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