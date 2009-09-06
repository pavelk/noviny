ActionController::Routing::Routes.draw do |map|
  

  
  #Added by Jan Uhlar
  map.home "home", :controller=>"web/sections"
  map.ajax_request "web/ajax/:action",:controller=>"web/ajax"
  
  map.with_options :controller => 'web/articles' do |article|
    article.articles   'articles/:action/:id', :action  => 'index', :id=>nil
  end
  
  map.with_options :controller => 'web/sections' do |section|
    section.sections  'sections/:action/:id', :action  => 'index', :id=>nil
  end
  #Added by Jan Uhlar
  
  map.resources :info_boxes
=begin

  map.resources :themes
  map.resources :insets
  map.resources :audios
  map.resources :content_types
  map.resources :authors
  map.resources :sections
  map.resources :articles
  map.resources :albums
  map.resources :pictures
=end
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
    admin.resources :info_boxes
    admin.resources :article_selections
  end
  
  
  map.remove_relationship 'admin/relationships/remove_rel/:id/:rel', :controller => 'admin/relationships', :action => 'delete', :method => 'post'
  
  map.add_img 'admin/articles/add_img/:art/:pic', :controller => 'admin/articles', :action => 'add_img'
  map.remove_img 'admin/articles/remove_img/:art/:pic', :controller => 'admin/articles', :action => 'remove_img'
  
  map.add_file 'admin/articles/add_file/:art/:pic', :controller => 'admin/articles', :action => 'add_file'
  map.remove_file 'admin/articles/remove_file/:art/:pic', :controller => 'admin/articles', :action => 'remove_file'
  
  map.add_audio 'admin/articles/add_audio/:art/:pic', :controller => 'admin/articles', :action => 'add_audio'
  map.remove_audio 'admin/articles/remove_audio/:art/:pic', :controller => 'admin/articles', :action => 'remove_audio'
  
  map.add_box 'admin/articles/add_box/:art/:pic', :controller => 'admin/articles', :action => 'add_box'
  map.remove_box 'admin/articles/remove_box/:art/:pic', :controller => 'admin/articles', :action => 'remove_box'
  
  map.add_author_img 'admin/authors/add_img/:art/:pic', :controller => 'admin/authors', :action => 'add_img'
  map.remove_author_img 'admin/authors/remove_img/:art/:pic', :controller => 'admin/authors', :action => 'remove_img'
  
  map.add_author_file 'admin/authors/add_file/:art/:pic', :controller => 'admin/authors', :action => 'add_file'
  map.remove_author_file 'admin/authors/remove_file/:art/:pic', :controller => 'admin/authors', :action => 'remove_file'
  
  map.get_content_type 'admin/articles/get_content_type/:content_type/:content_value/:id', :controller => 'admin/articles', :action => 'get_content_type'
  map.get_subsection 'admin/articles/get_subsection/:section/:id', :controller => 'admin/articles', :action => 'get_subsection'
  
  map.get_versions 'admin/articles/get_versions/:id', :controller => 'admin/articles', :action => 'get_versions'
  map.get_version 'admin/articles/get_version/:id/:version', :controller => 'admin/articles', :action => 'get_version'
  map.revert_version 'admin/articles/revert_version/:id/:version', :controller => 'admin/articles', :action => 'revert_version'
  
  map.add_infobox_img 'admin/info_boxes/add_img/:art/:pic', :controller => 'admin/info_boxes', :action => 'add_img'
  map.remove_infobox_img 'admin/info_boxes/remove_img/:art/:pic', :controller => 'admin/info_boxes', :action => 'remove_img'
  
  map.resource  :user_session,
                :as => 'prihlaseni',
                :path_names => { :new => 'nove' }
                
  map.connect "errors/:action/:id", :controller => "logged_exceptions"
  
  
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
