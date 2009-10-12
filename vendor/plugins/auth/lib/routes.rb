module Routes
  class << ActionController::Routing::Routes;self;end.class_eval do
    define_method :clear!, lambda {}
  end
  
  ActionController::Routing::Routes.draw do |map|
    map.login "login",:controller=>"auth",:action=>"login"
    map.logout "logout",:controller=>"auth",:action=>"logout"
    map.signup "signup",:controller=>"auth",:action=>"signup"
    map.lostpassword "lostpassword",:controller=>"auth",:action=>"lostpassword" 
    
    map.auth 'auth/:action/:id',
      :controller => 'auth', :action => nil, :id => nil
    map.authadmin 'authadmin/:action/:id',
      :controller => 'authadmin', :action => nil, :id => nil
      
    map.connect ':controller/:action/:id',:id=>nil
    map.connect ':controller/:action/:id.:format'  
  end
  ActionController::Routing::RouteSet.class_eval do
    include Routes
  end
end