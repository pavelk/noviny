class ArticleBanner < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :picture
  
  has_many :articlebanner_sections
  has_many :sections, :through => :articlebanner_sections
  
  has_many :flashphoto_banners
=begin
  after_save do |ab|
    debugger
    a = ArticleBanner.find(ab)
    if(a.articlebanner_sections.size > 0)
    ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_section = priority_section - 1 
                                           WHERE priority_section <= #{a.priority_section} 
                                           && priority_section > 1 
                                           && publish_date LIKE '%#{a.publish_date.strftime("%Y-%m-%d").to_s}%'
                                           && id <> #{a.id}
                                           && id IN ( SELECT article_banner_id FROM articlebanner_sections WHERE section_id IN (#{a.articlebanner_sections.collect {|f| f.section_id }.join(',')}) )"                                      
    ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_home = priority_home - 1 
                                           WHERE priority_home <= #{a.priority_home} 
                                           && priority_home > 1 
                                           && publish_date LIKE '%#{a.publish_date.strftime("%Y-%m-%d").to_s}%'
                                           && id <> #{a.id} 
                                           && id IN ( SELECT article_banner_id FROM articlebanner_sections WHERE section_id = 9999 )"
                                           
    ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_section = 1 
                                           WHERE priority_section > 1
                                           && publish_date < current_date()"
                                           
   ActiveRecord::Base.connection.execute "UPDATE article_banners SET priority_home = 1 
                                          WHERE priority_home > 1
                                          && publish_date < current_date()"                                       
                                                                                  
    end                                       
  end
=end 
end
