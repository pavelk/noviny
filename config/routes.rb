ActionController::Routing::Routes.draw do |map|
  map.resources :content_types

  map.resources :authors

  map.resources :subsections

  map.resources :sections

  map.resources :articles

  map.resources :albums

  
  
  map.resources :pictures

  #map.root :controller => 'user_sessions', :action => 'new'
  map.root :controller => 'admin/albums', :action => 'index'
  
  map.namespace :admin do |admin|
    admin.resources :users, 
                    :as => 'uzivatele', 
                    :path_names => { :new => 'novy-uzivatel', :edit => 'editace' }
    admin.resources :pictures
    admin.resources :albums,
                    :collection => { :get_level => :get }
    admin.resources :articles
    admin.resources :authors               
  end
  
  map.add_file 'admin/articles/add_file/:art/:pic', :controller => 'admin/articles', :action => 'add_file'
  map.remove_file 'admin/articles/remove_file/:art/:pic', :controller => 'admin/articles', :action => 'remove_file'
  map.get_content_type 'admin/articles/get_content_type/:content_type/:content_value/:id', :controller => 'admin/articles', :action => 'get_content_type'
  
  map.resource  :user_session,
                :as => 'prihlaseni',
                :path_names => { :new => 'nove' }
                
  
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
