class Section < ActiveRecord::Base
  
  acts_as_nested_set
  
  belongs_to :user
  belongs_to :author
  
  #has_many :articles
  has_many :article_sections
  has_many :articles, :through => :article_sections
  
  
end
