class Admin::ArticlesController < Admin::AdminController
  
  create.before :set_user
  create.after :process_adding_pictures, :process_adding_files, 
               :process_adding_audios, :process_adding_boxes, 
               :process_sections, :multi_tag_create, :process_related, :set_values 
  update.after :process_sections, :process_related, :set_values
  update.before :multi_tag 
  
  def index
    #debugger
    if(params[:search])
      @articles = Article.search params[:search], :page => params[:page], :per_page => 10, :order => 'publish_date DESC'
    else
      @articles = Article.all( :order => 'publish_date DESC' ).paginate( :per_page => 10, :page => params[:page] )
    end 
    respond_to do |format|
      format.js
    end
  end  
  
  def get_relarticles
    #debugger
    @articles = Article.all(:conditions => "id in (#{params[:related_sidebar].values.join(',')})") 
    
    respond_to do |format|  
      format.js
    end
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
    if(params[:id])
    @article = Article.find(params[:id])
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[@article.content_type.name]  
    else  
    @article = Article.new
    @article.content_type_id = params[:content_value]
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[params[:content_type]]
    end
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'], @article_config['video'] ]
    respond_to do |format|  
      format.js
    end
  end  
  
  def add_file
    @article = Article.find(params[:art])
    @file = Inset.find(params[:pic])
    @article.insets << @file

    respond_to do |format|  
      format.js
    end 
  end
  
  def get_versions
    #debugger
    @article = Article.find(params[:id])
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[@article.content_type.name]
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'] ]
    respond_to do |format|  
      format.js
    end
  end
  
  def get_version
    #debugger
    @article = Article.find(params[:id])
    @version = @article.versions.find(params[:version])
    #dodelat - verze i pro ruzne typy
    @article_config = YAML.load_file("#{RAILS_ROOT}/config/articles.yml")[@article.content_type.name]
    @content_type = [ @article_config['nadpis'], @article_config['perex'], @article_config['text'], @article_config['poznamka'] ]
    respond_to do |format|  
      format.js
    end
  end
  
  def revert_version
    #debugger
    article = Article.find(params[:id])
    @version = article.versions.find(params[:version])
    article.revert_to!(@version.version)
    render :nothing => true
  end
  
  def remove_file
    @article = Article.find(params[:art])
    @file = Inset.find(params[:pic])
    @article.insets.delete(@file)

    #render :nothing => true
    #render :json => @picture
    respond_to do |format|  
      format.js
    end 
  end
  
  
  def add_img
    @article = Article.find(params[:art])
    @picture = Picture.find(params[:pic])
    @article.pictures << @picture

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_img
    @article = Article.find(params[:art])
    @picture = Picture.find(params[:pic])
    @article.pictures.delete(@picture)

    #render :nothing => true
    #render :json => @picture
    respond_to do |format|  
      format.js
    end 
  end
  
  
  def add_audio
    @article = Article.find(params[:art])
    @audio = Audio.find(params[:pic])
    @article.audios << @audio

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_audio
    @article = Article.find(params[:art])
    @audio = Audio.find(params[:pic])
    @article.audios.delete(@audio)

    #render :nothing => true
    #render :json => @picture
    respond_to do |format|  
      format.js
    end 
  end
  
  def add_box
    @article = Article.find(params[:art])
    @box = InfoBox.find(params[:pic])
    @article.info_boxes << @box

    respond_to do |format|  
      format.js
    end 
  end
  
  def remove_box
    @article = Article.find(params[:art])
    @box = InfoBox.find(params[:pic])
    @article.info_boxes.delete(@box)
    
    respond_to do |format|  
      format.js
    end 
  end
  
  def get_subsection
    if(params[:id])
      @article = Article.find(params[:id])
    else
      @article = Article.new 
    end  
    @section = Section.find(params[:section])
    @subsection = @section.children
    
    respond_to do |format|  
      format.js
    end
  end     

private
  
  def process_related
    if(params[:related_sidebar])
      params[:related_sidebar].each_value do |r|
        relationship = @article.relationships.build(:relarticle_id => r)
        relationship.save
      end
    end
    if(params[:related_themes])
      params[:related_themes].each_value do |r|
        art = Theme.find(r)
        @article.themes << art
      end
    end  
  end
    
  def multi_tag    
    if(params[:tag_list_multi])
      tlm = params[:tag_list_multi].join(", ")
      params[:article][:tag_list] = params[:article][:tag_list] + ', ' + tlm
    end  
  end
  
  def multi_tag_create    
    if(params[:tag_list_multi])
        @article.tag_list = params[:article][:tag_list] + ', ' + params[:tag_list_multi].join(", ")
        @article.save
    end  
  end
  
  def process_sections
    @article.attributes = {'section_ids' => []}.merge(params[:article] || {})
  end  

  def process_adding_pictures
    if(params[:pictures])
      params[:pictures].each_value do |p|
        pict = Picture.find(p)
        @article.pictures << pict
      end
    end      
  end
  
  def process_adding_files
    if(params[:files])
      params[:files].each_value do |f|
        fil = Inset.find(f)
        @article.insets << fil
      end
    end      
  end
  
  def process_adding_audios
    if(params[:audios])
      params[:audios].each_value do |a|
        aud = Audio.find(a)
        @article.audios << aud
      end
    end      
  end
  
  def process_adding_boxes
    if(params[:boxes])
      params[:boxes].each_value do |b|
        box = InfoBox.find(b)
        @article.info_boxes << box
      end
    end      
  end
  
  def set_values
    #debugger
    if(params[:publish_time].size == 0)
      p_time = ' 04:00:00'
    else
      p_time = ' ' + params[:publish_time] + ':00'
    end    
    @article.update_attributes( :publish_date => params[:publish_date].split('/').reverse.join('-') + p_time) 
  end  

  def adjust_home_priority( p, id )
    #ActiveRecord::Base.connection.execute "UPDATE articles SET priority_home = priority_home + 1 WHERE priority_home >= #{p} && priority_home <= 9"
  end  

  def load_config(type)
    
  end  
  
  def set_user
    @article.user_id = current_user.id
  end
  
end
