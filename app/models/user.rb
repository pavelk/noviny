class User < ActiveRecord::Base
  
  has_many :pictures
  
  acts_as_authentic do |c|
    c.login_field = 'email'
    c.validates_length_of_password_field_options = { :minimum => 5 }
  end
  
  validates_presence_of :user_name
    
end