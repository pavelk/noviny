class Web::ExportController < ApplicationController

  layout false

  def newton

    if params[:FromDate].nil? or params[:ToDate].nil?
      render :text => "Wrong format."
    else
      from_date = DateTime.strptime( params[:FromDate], "%Y-%m-%d-%H%M%S" ).to_s(:db)
      to_date = DateTime.strptime( params[:ToDate], "%Y-%m-%d-%H%M%S" ).to_s(:db)

      @articles = Article.find(:all,
       :conditions => "'#{from_date}' <= publish_date AND '#{to_date}' >= publish_date",
       :select => "articles.text, articles.perex, articles.publish_date, articles.name, articles.author_id, articles.section_id, articles.id",
       :include => [:author, { :article_sections => :section }])
      render :action => "newton.xml.builder"
    end
  end

  def anopress

    format = /^.{4}\d{8}$/
    if params[:file].nil? or params[:file] !~ format
      render :text => "Wrong format."
    else
      date = params[:file].sub(/^.{4}/,"")
      date = Date.strptime( date, "%Y%m%d" ).to_s(:db)

      @articles = Article.find(:all,
       :conditions => "'#{date} 00:00:00' <= publish_date AND '#{date} 23:59:59' >= publish_date",
       :select => "articles.text, articles.publish_date, articles.name, articles.section_id, articles.id",
       :include => [{ :article_sections => :section }])
      render :action => "anopress.xml.builder"
    end
  end

private  
  def check_authentication
    flash[:error] = "" if flash[:error] == "Musíte se přihlásit pro přístup na tuto stránku."
    return false
  end

end
