class User < ActiveRecord::Base
  
  has_many :authors
  has_many :articles
  has_many :sections
  has_many :tags
  has_many :text_pages
  
  acts_as_authentic do |c|
    c.login_field = 'email'
    c.validates_length_of_password_field_options = { :minimum => 5 }
  end
  
  #validates_presence_of :user_name
  #named_scope :authors, :conditions => "authors.user_id IS NULL LEFT OUTER JOIN authors ON users.id=authors.user_id", :order => 'RAND()'
  
    
end