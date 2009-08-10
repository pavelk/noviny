class Admin::ArticlesController < Admin::AdminController
  
  create.before :set_user
  #create.after :adjust_home_priority
  #update.after :adjust_home_priority
  
  index.response do |wants|
    wants.js
  end
  
  show.response do |wants|
    wants.js
  end 
  
  new_action.response do |wants|
    wants.js
  end
  
  create.response do |wants|
    wants.js
  end
  
  edit.response do |wants|
    wants.js
  end
  
  update.response do |wants|
    wants.js
  end
  
  
  #[index, show, new_action, create, edit, update].each { |action| action.response do
  #    wants.js
  #  end
  #}
  
  new_action.before do
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")['Zpráva']
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'] ]
  end
  
  edit.before do
    @article = Article.find(params[:id])
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[@article.content_type.name]
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'] ]
    #adjust_home_priority(params[:id][:priority_home], params[:id][:id])
  end
  
  edit.after do
    #adjust_home_priority(params[:id][:priority_home], params[:id][:id])
  end  
  
  def get_content_type
    if(params[:id].size > 0)
    @article = Article.find(params[:id])
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[@article.content_type.name]  
    else  
    @article = Article.new
    @article.content_type_id = params[:content_value]
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[params[:content_type]]
    end
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'] ]
    respond_to do |format|  
      format.js
    end
  end  
  
  def add_file
    @article = Article.find(params[:art])
    @picture = Picture.find(params[:pic])
    @article.pictures << @picture

    #render :nothing => true
    #render :json => @picture
    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_file
    @article = Article.find(params[:art])
    @picture = Picture.find(params[:pic])
    @article.pictures.delete(@picture)

    #render :nothing => true
    #render :json => @picture
    respond_to do |format|  
      format.js
    end 
  end   

private

  def adjust_home_priority( p, id )
    ActiveRecord::Base.connection.execute "UPDATE articles SET priority_home = priority_home + 1 WHERE priority_home >= #{p} && priority_home <= 9"
  end  

  def load_config(type)
    
  end  
  
  def set_user
    @article.user_id = current_user.id
  end
  
end
