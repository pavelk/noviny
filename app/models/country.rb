class Country < ActiveRecord::Base
  has_many :web_users
  CZE_CODE = "CZ"
  
  def self.all_sorted(order = "name")
    find(:all,:order=>order)
  end
  
  def self.cze_id
    find(:first,:conditions=>{:c_code=>CZE_CODE}).id
  end
  
end
