class Relationship < ActiveRecord::Base
  
  belongs_to :article
  belongs_to :relarticle, :class_name => "Article"
  
end
