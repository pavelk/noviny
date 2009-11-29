class Newsletter < ActiveRecord::Base
  validates_format_of :email, :with => WebUser::VALID_EMAIL,:message=>"Email má nesprávný formát"
  validates_uniqueness_of :email, :message=>"Tento email již odebírá zpravodaj"
  
  has_many :newsletters_mailings, :dependent => :destroy
  has_many :mailings, :through => :newsletters_mailings
  
  def self.all_active
    find(:all,:conditions=>{:active=>true})
  end
end
