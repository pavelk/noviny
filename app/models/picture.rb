class Picture < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :album, :counter_cache => true
  
  has_many :article_pictures
  has_many :articles, :through => :article_pictures
  
  has_many :author_pictures
  has_many :authors, :through => :author_pictures
    
  #validates_presence_of :name
  #validates_uniqueness_of :name
  #before_save :save_dimensions 

  
  has_attached_file :data, :styles => { :small => "x85>" },
                    :url  => "/assets/pictures/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/pictures/:id/:style/:basename.:extension"
                    
  #validates_attachment_presence :data
  #validates_attachment_size :data, :less_than => 5.megabytes
  #validates_attachment_content_type :data, 
  #                                  :content_type => ['image/jpeg', 'image/pjpeg', 'image/jpg', 
  #                                                    'image/png']
                                                                                                                   
  #default_style => :original
  
  private
  
    #def save_dimensions(style = :styles => :original) 
    #  self.data_width = Paperclip::Geometry.from_file(to_file(style)).width 
    #  self.data_height = Paperclip::Geometry.from_file(to_file(style)).height 
    #end
  
end