class Web::RssController < ApplicationController
  layout false
  @@limit = 100
  
 def index
   @articles = Article.find(:all,
                           :conditions=>["publish_date <= ? AND approved = ? AND visibility = ?",Time.now,true,false],
                           :select=>"order_date, order_time, id, name, perex, author_id",
                           :order =>"order_date DESC, order_time DESC",
                           :include=>[:author],
                           :limit=>@@limit)
    @rss_link = home_url
    @rss_desc = "Všechny články"
    render :action=>"index.rss.builder"
 end

  def section
    section_id = params[:section_id]
    @articles = Article.find(:all,
                           :conditions=>["article_sections.section_id = ? AND publish_date <= ? AND approved = ? AND visibility = ?",section_id,Time.now,true,false],
                           :select=>"order_date, order_time, articles.id, articles.name, perex, articles.author_id",
                           :order =>"order_date DESC, order_time DESC",
                           :group=>"articles.id",
                           :joins=>[:article_sections],
                           :include=>[:author],
                           :limit=>@@limit)
    if !section_id.blank?
      section = Section.find(section_id)
    end
    @rss_link = section_url(:name=>section.name) if section 
    @rss_desc = "Články"
    @rss_desc += " z rubriky #{section.name}" if section
    render :action=>"index.rss.builder"
  end

  def news
    section_id = params[:section_id]
    op = ""
    op += "article_sections.section_id = #{section_id} AND " unless section_id.blank?
    @articles = Article.find(:all,
                           :conditions=>["#{op}articles.content_type_id = ? AND publish_date <= ? AND approved = ? AND visibility = ?",ContentType::ZPRAVA,Time.now,true,false],
                           :select=>"order_date, order_time, articles.id, articles.name, perex, articles.author_id",
                           :order =>"order_date DESC, order_time DESC",
                           :group=>"articles.id",
                           :joins=>[:article_sections],
                           :include=>[:author],
                           :limit=>@@limit)
   
    @rss_desc = "Zprávy"
    @rss_desc += " z rubriky #{Section.find(section_id).name}" if !section_id.blank?
    @rss_link = home_url
    render :action=>"index.rss.builder"
  end

private  
  def check_authentication
    flash[:error] = "" if flash[:error] == "Musíte se přihlásit pro přístup na tuto stránku."
    return false
  end
end

