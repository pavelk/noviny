class Fond < ActiveRecord::Base
  has_many :really_fonds

  FIELDS = {
            :amount => 1,
            :firstname =>2,
            :lastname => 3,
            :sex => 4,
            :email => 5,
            :street => 6,
            :number => 7,
            :city => 8,
            :psc =>9,
            :profession => 10,
            :phone => 11,
            :title => 12
  }

  validates_presence_of :firstname,:message=>"Musíte vyplnit jméno"
  validates_presence_of :lastname,:message=>"Musíte vyplnit příjmení"
  validates_presence_of :street,:message=>"Ulice musí být vyplněna"
  validates_presence_of :city,:message=>"Obec musí být vyplněna"
  validates_presence_of :number,:message=>"Číslo p. musí být vyplněné"
  validates_presence_of :psc,:message=>"Směrovací číslo musí být vyplněné"
  validates_presence_of :email,:message=>"Email nemůže být prázdný"
  validates_presence_of :amount,:message=>"Vyberte částku"
  validates_inclusion_of :sex,:in => [true,false], :message=>"Vyberte pohlaví"
  validates_uniqueness_of :email, :message => "Uvedený email je již registrován"
  validates_uniqueness_of :variable_number, :message => "Tento variabilní symbol již existuje"

  # Regex to validate an email
  VALID_EMAIL = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/ unless defined? VALID_EMAIL

  validates_format_of :email, :with => VALID_EMAIL,:message=>"Email má nesprávný formát", :if=>:email?

  after_create :set_variable_number, :send_email

  protected

  def set_variable_number
    var1 = DateTime.now.strftime("%y%m%d")
    last_user = Fond.first(:conditions => [ "variable_number like ? ", "#{var1}%" ], :order => 'created_at desc' )
    last_user ? var2 = last_user.variable_number.to_s.sub(/^\d{6}/,"").to_i + 1 : var2 = 1
    self.variable_number =  var1 + sprintf("%04d", var2)
    self.save
  end

  def send_email
    begin
      Notification.deliver_fond_registration(self)
    rescue
    end
  end

end
