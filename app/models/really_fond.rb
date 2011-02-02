class ReallyFond < ActiveRecord::Base
  belongs_to :fond

  validates_presence_of :amount,:message=>"Musíte vyplnit částku"
  validates_presence_of :date,:message=>"Musíte vyplnit datum platby"

  validates_numericality_of :amount, :only_integer => true, :greater_than => 1, :message => "Částka musí být celé kladné číslo"

  FIELDS = {
    :amount => 1,
    :date => 2
  }

end
