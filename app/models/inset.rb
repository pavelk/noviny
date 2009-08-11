class Inset < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :album, :counter_cache => true
  
  
  has_attached_file :data,
                    :url  => "/assets/files/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/files/:id/:style/:basename.:extension"
  
end
