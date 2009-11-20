module Routes
  class << ActionController::Routing::Routes;self;end.class_eval do
    define_method :clear!, lambda {}
  end
  
  ActionController::Routing::Routes.draw do |map|
    map.login "prihlaseni-uzivatele",:controller=>"auth",:action=>"login"
    map.logout "odhlaseni-uzivatele",:controller=>"auth",:action=>"logout"
    map.signup "registrace-uzivatele",:controller=>"auth",:action=>"signup"
    map.signup2 "registrace-uzivatele-platba",:controller=>"auth",:action=>"signup2"
    map.signup_paysec "registrace-uzivatele-paysec",:controller=>"auth",:action=>"pay_method"
    map.confirm_payment "potvrzeni-platby",:controller=>"auth",:action=>"confirm_payment"
    map.cancel_payment "zruseni-platby",:controller=>"auth",:action=>"cancel_payment"
    
    map.user_info "uzivatel/info",:controller=>"auth",:action=>"info"
    map.user_payments "uzivatel/platby",:controller=>"auth",:action=>"payments"
    map.user_new_payment "uzivatel/nova-platba",:controller=>"auth",:action=>"pay"
    map.pay_paysec "zaplatit-paysec",:controller=>"auth",:action=>"pay_method"
    
    map.lostpassword "ztracene-heslo",:controller=>"auth",:action=>"lostpassword"
    map.rules "diskuse-a-predplatne",:controller=>"auth",:action=>"pravidla" 
    map.codex "eticky-kodec",:controller=>"auth",:action=>"codex" 
    
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