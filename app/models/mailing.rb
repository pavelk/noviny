class Mailing < ActiveRecord::Base
  has_many :newsletters_mailings, :dependent => :destroy
  has_many :newsletters, :through => :newsletters_mailings
  

  class << columns_hash['sent_on']
    def type
      :date
    end
  end

end
