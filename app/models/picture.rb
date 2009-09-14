class Picture < ActiveRecord::Base
  
  #new  migrations
  has_many :headliner_boxes
  has_many :article_banners
  #
  
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
  
  
  has_attached_file :data, :styles => { :small => "85x85", 
                                        :hp_main => "440x",
                                        :hp_sidebar => "140x140^",
                                        :author_little => "65x65^",
                                        :preview_bottom => "140x140^",
                                        :sidebar_article => "65x65^",
                                        :articles_preview => "140x",
                                        :article_profile => "178x",
                                        :gallery_big => "440x440",
                                        :author_image => "178x178^"
                                         },
                    :convert_options => { :hp_sidebar => ' -gravity Center -extent 140x130',
                                          :author_little => ' -gravity Center -extent 65x60',
                                          :preview_bottom => ' -gravity Center -extent 140x90',
                                          :sidebar_article => ' -gravity Center -extent 65x41',
                                          :author_image => ' -gravity Center -extent 178x178'
                                        },
                    :url  => "/assets/pictures/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/pictures/:id/:style/:basename.:extension"
                      
    #Added by Jan Uhlar
    #Returns paginated pictures from article given by 'article_id' 
    def self.paginate_from_article(article_id, page = 1, per_page = 6)
      paginate(:all,
           :conditions=>["article_pictures.article_id = ?",article_id],
           :page=>page,
           :joins=>[:articles],
           :per_page=>per_page)
    end
  
  
end