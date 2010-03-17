ActionController::Routing::Routes.draw do |map|

  map.administrace 'administrace', :controller => 'admin/albums', :action => 'index'
  map.preview_article 'preview/articles/:id', :controller => 'web/articles', :action => 'detail'
  #Added by Jan Uhlar
  map.test_proxy "proxy/test/:sleep", :controller=>"web/sections", :action => 'test_proxy'
  map.mailings "/hromadne-emaily", :controller=>"mailings"
  map.confirm_delete_newsletter "/confirm_delete_newsletter/:email/:crypted", :controller=>"auth", :action=>"confirm_delete_newsletter", :email=>/.*.*/
  map.delete_newsletter "/zrusit_zpravodaj", :controller=>"auth", :action=>"delete_newsletter"
  map.rss "web/rss/:action/:section_id", :controller=>"web/rss",:action=>nil,:section_id=>nil
  
  map.home "", :controller=>"web/sections"
  map.ajax_request "web/ajax/:action",:controller=>"web/ajax"
  
  map.archiv "/clanky/archiv/:date",:controller => 'web/articles',:action=>"archiv",
            :date => nil,
            :conditions => { :method => [:get,:post] } 
  map.archiv_get "/clanky/archiv/:date",:controller => 'web/articles',:action=>"archiv",
            :date => /\d{2}\.\d{2}\.\d{4}/,
            :conditions => { :method => :get }
            
  map.authors_info "/autori", :controller => 'web/articles',:action=>"authors"
  map.detail_article "/clanek/:id",:controller => 'web/articles',:action=>"detail"
  map.gallery_article "/clanek-galerie/:id",:controller => 'web/articles',:action=>"detail_gallery"
  map.delete_comment "/clanek/smazat_komentar/:id",:controller => 'web/articles',:action=>"delete_comment"
  map.section_succ "/rubrika/:name/zobrazit-dalsi/:succ_date",:controller => 'web/sections',:action=>"detail"
  map.section_prev "/rubrika/:name/zobrazit-predchozi/:prev_date",:controller => 'web/sections',:action=>"detail"

  map.section "/rubrika/:name",:controller => 'web/sections',:action=>"detail"
 
  map.subsection "/podrubrika/:name",:controller => 'web/sections',:action=>"subsection"
  map.topics "/temata",:controller => 'web/sections',:action=>"topics"
  map.topic "/tema/:name",:controller => 'web/articles',:action=>"topic"
  map.author_info "/autor/:name",:controller => 'web/articles',:action=>"author_info"
  map.print_article "/clanek/tisk/:id",:controller => 'web/articles',:action=>"detail",:print=>1
  map.text_page "/stranka/:name",:controller => 'web/text_pages',:action=>"show"
  map.search "/hledani",:controller => 'web/sections',:action=>"search"
  map.download_audio "/download/audio/:id",:controller => 'web/articles',:action=>"download_audio"
  map.download_inset "/download/inset/:id",:controller => 'web/articles',:action=>"download_inset"
  map.user_info "/uzivatel/info/:id",:controller => 'web/web_users',:action=>"info"
  
  map.hp "/preview/headliner/:id",:controller => 'web/text_pages',:action=>"hp_box"
  map.gp "/preview/banner/:id",:controller => 'web/text_pages',:action=>"gp_box"
            
  map.with_options :controller => 'web/articles' do |article|
    article.articles   'clanek/:action/:id', :action  => 'index', :id=>nil
  end
  
  map.with_options :controller => 'web/sections' do |section|
    section.sections  'sekce/:action/:id', :action  => 'index', :id=>nil
  end
  
  map.with_options :controller => 'web/text_pages' do |text_page|
    text_page.show  'stranka/:action/:id', :action  => 'show', :id=>nil
  end
  #Added by Jan Uhlar
  
  map.resources :info_boxes

  map.root :controller => 'admin/albums', :action => 'index'
  
  map.namespace :admin do |admin|
    admin.resources :users, 
                    :as => 'uzivatele', 
                    :path_names => { :new => 'novy-uzivatel', :edit => 'editace' }
    admin.resources :pictures
    admin.resources :audios
    admin.resources :insets
    admin.resources :albums,
                    :collection => { :get_level => :get, :search => :get }
    admin.resources :articles
    admin.resources :authors
    admin.resources :themes
    admin.resources :sections
    admin.resources :relationships
    admin.resources :relationthemeships
    admin.resources :info_boxes
    admin.resources :article_selections
    admin.resources :dailyquestions
    admin.resources :tag_selections
    admin.resources :article_banners
    admin.resources :headliner_boxes
    admin.resources :text_pages
    admin.resources :holiday_definitions
  end
  
  #navrh na preview z admina
  map.detail 'articles/detail/:id', :controller => 'articles', :action => 'detail'
  map.preview_headliner 'preview/headliner/:id', :controller => 'headliner_boxes', :action => 'detail'
  map.preview_banner 'preview/banner/:id', :controller => 'article_banners', :action => 'detail'
  #konec navrhu
  
  map.remove_relationship 'admin/relationships/remove_rel/:id/:rel', :controller => 'admin/relationships', :action => 'delete', :method => 'post'
  map.remove_relationthemeship 'admin/relationthemeships/remove_rel/:id/:rel', :controller => 'admin/relationthemeships', :action => 'delete', :method => 'post'
  map.remove_tagselection 'admin/tag_selections/remove_rel/:id/:rel', :controller => 'admin/tag_selections', :action => 'delete', :method => 'post'
  map.remove_headliner_article 'admin/headliner_boxes/remove_rel/:id/:rel', :controller => 'admin/headliner_boxes', :action => 'delete', :method => 'post'
    
  ###
  #realtime assets to articles
  map.add_image 'admin/pictures/add_image/:object/:id/:class', :controller => 'admin/pictures', :action => 'add_image'
  map.remove_image 'admin/pictures/remove_image/:object/:id/:class', :controller => 'admin/pictures', :action => 'remove_image'
  
  map.add_file 'admin/insets/add_file/:object/:id/:class', :controller => 'admin/insets', :action => 'add_file'
  map.remove_file 'admin/insets/remove_file/:object/:id/:class', :controller => 'admin/insets', :action => 'remove_file'
  
  map.add_audio 'admin/audios/add_audio/:object/:id/:class', :controller => 'admin/audios', :action => 'add_audio'
  map.remove_audio 'admin/audios/remove_audio/:object/:id/:class', :controller => 'admin/audios', :action => 'remove_audio'
  
  map.add_box 'admin/info_boxes/add_box/:object/:id/:class', :controller => 'admin/info_boxes', :action => 'add_box'
  map.remove_box 'admin/info_boxes/remove_box/:object/:id/:class', :controller => 'admin/info_boxes', :action => 'remove_box'
  ###
  
  map.add_flashimage_headliner 'admin/headliner_boxes/add_flash_image', :controller => 'admin/headliner_boxes', :action => 'add_flash_image'
  map.add_flashimage_banner 'admin/article_banners/add_flash_image', :controller => 'admin/article_banners', :action => 'add_flash_image'
  map.add_flashimage_article 'admin/articles/add_flash_image', :controller => 'admin/articles', :action => 'add_flash_image'
  ###
  #old assets
  #map.add_img 'admin/articles/add_img/:art/:pic', :controller => 'admin/articles', :action => 'add_img'
  #map.remove_img 'admin/articles/remove_img/:art/:pic', :controller => 'admin/articles', :action => 'remove_img'
  
  #map.add_file 'admin/articles/add_file/:art/:pic', :controller => 'admin/articles', :action => 'add_file'
  #map.remove_file 'admin/articles/remove_file/:art/:pic', :controller => 'admin/articles', :action => 'remove_file'
  
  #map.add_audio 'admin/articles/add_audio/:art/:pic', :controller => 'admin/articles', :action => 'add_audio'
  #map.remove_audio 'admin/articles/remove_audio/:art/:pic', :controller => 'admin/articles', :action => 'remove_audio'
  
  #map.add_box 'admin/articles/add_box/:art/:pic', :controller => 'admin/articles', :action => 'add_box'
  #map.remove_box 'admin/articles/remove_box/:art/:pic', :controller => 'admin/articles', :action => 'remove_box'
  
  #map.add_author_img 'admin/authors/add_img/:art/:pic', :controller => 'admin/authors', :action => 'add_img'
  #map.remove_author_img 'admin/authors/remove_img/:art/:pic', :controller => 'admin/authors', :action => 'remove_img'
  
  map.add_dailyquestion_img 'admin/dailyquestions/add_img/:art/:pic', :controller => 'admin/dailyquestions', :action => 'add_img'
  map.remove_dailyquestion_img 'admin/dailyquestions/remove_img/:art/:pic', :controller => 'admin/dailyquestions', :action => 'remove_img'
  
  #map.add_author_file 'admin/authors/add_file/:art/:pic', :controller => 'admin/authors', :action => 'add_file'
  #map.remove_author_file 'admin/authors/remove_file/:art/:pic', :controller => 'admin/authors', :action => 'remove_file'
  
  map.get_content_type 'admin/articles/get_content_type/:content_type/:content_value/:id', :controller => 'admin/articles', :action => 'get_content_type'
  #map.get_subsection 'admin/articles/get_subsection/:section/:id', :controller => 'admin/articles', :action => 'get_subsection'
  map.get_subsection 'admin/sections/get_subsection/:section/:id/:class', :controller => 'admin/sections', :action => 'get_subsection'
  
  map.get_versions 'admin/articles/get_versions/:id', :controller => 'admin/articles', :action => 'get_versions'
  map.get_version 'admin/articles/get_version/:id/:version', :controller => 'admin/articles', :action => 'get_version'
  map.revert_version 'admin/articles/revert_version/:id/:version', :controller => 'admin/articles', :action => 'revert_version'
  
  #map.add_infobox_img 'admin/info_boxes/add_img/:art/:pic', :controller => 'admin/info_boxes', :action => 'add_img'
  #map.remove_infobox_img 'admin/info_boxes/remove_img/:art/:pic', :controller => 'admin/info_boxes', :action => 'remove_img'
  
  map.get_relarticles 'admin/articles/get_relarticles', :controller => 'admin/articles', :action => 'get_relarticles'
  map.get_relthemes 'admin/themes/get_relthemes', :controller => 'admin/themes', :action => 'get_relthemes'
  
  map.get_linked_imgs 'admin/pictures/get_linked_imgs', :controller => 'admin/pictures', :action => 'get_linked_imgs'
  
  map.resource  :user_session,
                :as => 'prihlaseni',
                :path_names => { :new => 'nove' }
                
  map.connect "errors/:action/:id", :controller => "logged_exceptions"
  
  
  map.connect ':controller/:action/:id',:id=>/.*[\.]*.*/
  map.connect ':controller/:action/:id.:format'
  map.connect '*path', :controller => 'web/text_pages', :action => 'error'
end