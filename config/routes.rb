ActionController::Routing::Routes.draw do |map|
  map.resources :albums

  
  
  map.resources :pictures

  #map.root :controller => 'user_sessions', :action => 'new'
  map.root :controller => 'admin/albums', :action => 'index'
  
  map.namespace :admin do |admin|
    admin.resources :users, 
                    :as => 'uzivatele', 
                    :path_names => { :new => 'novy-uzivatel', :edit => 'editace' }
    admin.resources :pictures
                    #:as => 'pictures',
                    #:path_names => { :new => 'novy-obrazek' }
    admin.resources :albums,
                    #:as => 'obrazky',
                    #:path_names => { :new => 'novealbum', :edit => 'editace' },
                    :collection => { :get_level => :get }                    
  end
  
  map.resource  :user_session,
                :as => 'prihlaseni',
                :path_names => { :new => 'nove' }
                
  
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
