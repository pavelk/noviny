class Web::ExportController < ApplicationController

  layout false

  def newton

    if params[:FromDate].nil? or params[:ToDate].nil?
      render :text => "Wrong format."
    else
      from_date = DateTime.strptime( params[:FromDate], "%Y-%d-%m-%H%M%S" )
      to_date = DateTime.strptime( params[:ToDate], "%Y-%d-%m-%H%M%S" )

      @articles = Article.find(:all,
       :conditions => "'#{from_date}' < publish_date AND '#{to_date}' > publish_date",
       :select => "articles.text, articles.perex, articles.publish_date, articles.name, articles.author_id, articles.section_id, articles.id",
       :include => [:author, { :article_sections => :section }])
      render :action => "newton.xml.builder"
    end
  end

private  
  def check_authentication
    flash[:error] = "" if flash[:error] == "Musíte se přihlásit pro přístup na tuto stránku."
    return false
  end

end
