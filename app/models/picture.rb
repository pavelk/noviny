class Picture < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :album, :counter_cache => true
  
  has_many :article_pictures
  has_many :articles, :through => :article_pictures
  
  has_many :author_pictures
  has_many :authors, :through => :author_pictures
  
  has_many :info_box_pictures
  has_many :info_boxes, :through => :info_box_pictures
  
  define_index do
    indexes :name, :sortable => true
    indexes data_file_name
  end
  
  
    
  #validates_presence_of :name
  #validates_uniqueness_of :name
  #before_save :save_dimensions 
  
  has_attached_file :data, :styles => { :small => "x85>", :test => "100x100>" },
                    :convert_options => { :test => ' -extent 100x30 +repage' },
                    #:commands => { :test => "-background white -gravity center -extent 100x30 +repage" },
                    :url  => "/assets/pictures/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/pictures/:id/:style/:basename.:extension"
                    
                    
  #validates_attachment_presence :data
  #validates_attachment_size :data, :less_than => 5.megabytes
  #validates_attachment_content_type :data, 
  #                                  :content_type => ['image/jpeg', 'image/pjpeg', 'image/jpg', 
  #                                                    'image/png']
                                                                                                                   
  #default_style => :original
  
  #Added by Jan Uhlar
  #Returns paginated pictures from article given by 'article_id' 
  def self.paginate_from_article(article_id, page = 1, per_page = 3)
    paginate(:all,
         :conditions=>["article_pictures.article_id = ?",article_id],
         :page=>page,
         :joins=>[:articles],
         :per_page=>per_page)
  end
  
  private
  
    #def save_dimensions(style = :styles => :original) 
    #  self.data_width = Paperclip::Geometry.from_file(to_file(style)).width 
    #  self.data_height = Paperclip::Geometry.from_file(to_file(style)).height 
    #end
  
end