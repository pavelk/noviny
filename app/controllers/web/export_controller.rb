class Web::ExportController < ApplicationController

  layout false

  def newton

    if params[:FromDate].nil? or params[:ToDate].nil?
      render :text => "Wrong format."
    else
      from_date = DateTime.strptime( params[:FromDate], "%Y-%m-%d-%H%M%S" ).to_s(:db)
      to_date = DateTime.strptime( params[:ToDate], "%Y-%m-%d-%H%M%S" ).to_s(:db)

      @articles = Article.find(:all,
       :conditions => "'#{from_date}' <= created_at AND '#{to_date}' >= created_at",
       :select => "articles.text, articles.perex, articles.created_at, articles.name, articles.author_id, articles.section_id, articles.id",
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
