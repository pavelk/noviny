class Payment < ActiveRecord::Base
  PRICE_FORMAT = /(\d+\.\d+)|(\d+)/
  
  validates_uniqueness_of :variable_symbol, :if=>:variable_symbol?, :message=>"Tento symbol již existuje"
  validates_numericality_of :price, :greater_than=>0.0, :message=>"Špatná cena"
  
  VYTVORENO = 0
  ZAPLACENO_PAYSEC = 1
  ZAPLACENO_OFFLINE = 2
  
  belongs_to :web_user
  
  after_save :set_variable_symbol, :unless => :variable_symbol? 
  
  attr_protected  :payed_at,
                  :status,
                  :web_user_id,
                  :created_at,
                  :updated_at,
                  :variable_symbol
  
  def status_in_words(code = nil)
    if code
      statut = code
    else
      statut = self.status
    end
    case statut
      when VYTVORENO
        "Nezaplaceno"
      when ZAPLACENO_PAYSEC
        "Zaplaceno pomocí PaySec"
      when ZAPLACENO_OFFLINE
        "Zaplaceno offline"
    end 
  end
protected
   def set_variable_symbol
     if self.variable_symbol.blank?
       t = Time.now
       count = Payment.count(:conditions=>{:created_at=>t.beginning_of_month..t})
       symbol = "#{count}#{t.strftime('%m%y')}"
       self.variable_symbol = symbol
       self.save
     end
   end
end
