class InfoBox < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :author
  
  has_many :info_box_pictures
  has_many :pictures, :through => :info_box_pictures
  
  has_many :article_boxes
  has_many :articles, :through => :article_boxes
  
  define_index do
    indexes text
    indexes title, :sortable => true
    indexes :name, :sortable => true
  end
  
end