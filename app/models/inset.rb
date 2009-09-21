class Inset < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :album, :counter_cache => true
  
  has_many :article_insets
  has_many :articles, :through => :article_insets
  
  has_many :author_insets
  has_many :authors, :through => :author_insets
  
  define_index do
    indexes :name, :sortable => true
    indexes data_file_name
  end
  
  has_attached_file :data,
                    :url  => "/assets/files/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/files/:id/:style/:basename.:extension"  
end
