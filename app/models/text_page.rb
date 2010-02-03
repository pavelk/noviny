class TextPage < ActiveRecord::Base
  
  belongs_to :user
  
  has_many :text_page_pictures
  has_many :pictures, :through => :text_page_pictures
  
  has_many :text_page_insets
  has_many :insets, :through => :text_page_insets
  
  
  def self.all_visible
    find(:all,
         :conditions=>{:approved=>true,:visibility=>false},
         :select=>"id, name")
  end
end
