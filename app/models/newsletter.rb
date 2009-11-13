class Newsletter < ActiveRecord::Base
  validates_format_of :email, :with => WebUser::VALID_EMAIL,:message=>"Email má nesprávný formát"
  validates_uniqueness_of :email, :message=>"Tento email již odebírá zpravodaj"
end
