class FlashphotoBanner < ActiveRecord::Base

  belongs_to :article_banner

  has_attached_file :photo,
                    :url  => "/assets/article_banner/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/article_banner/:id/:style/:basename.:extension"

end