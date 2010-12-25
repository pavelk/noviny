class ReallyFond < ActiveRecord::Base
  belongs_to :fond
  
  validates_presence_of :account_number,  :message=>"Musíte vyplnit číslo účtu"
  validates_presence_of :variable_number, :message=>"Musíte vyplnit variabilní symbol"
  validates_presence_of :amount,:message=>"Musíte vyplnit částku"
  validates_presence_of :date,:message=>"Musíte vyplnit datum platby"

  FIELDS = {
    :account_number => 1,
    :variable_number => 2,
    :amount => 3,
    :standing_order => 4,
    :date => 5
  }

end