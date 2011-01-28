class Fond < ActiveRecord::Base
  has_many :really_fonds

  FIELDS = {
            :amount => 1,
            :firstname =>2,
            :lastname => 3,
            :email => 4,
            :street => 5,
            :number => 6,
            :city => 7,
            :psc =>8,
            :profession => 9,
            :phone => 10,
            :title => 11
  }

  validates_presence_of :firstname,:message=>"Musíte vyplnit jméno"
  validates_presence_of :lastname,:message=>"Musíte vyplnit příjmení"
  validates_presence_of :street,:message=>"Ulice musí být vyplněna"
  validates_presence_of :city,:message=>"Obec musí být vyplněna"
  validates_presence_of :number,:message=>"Číslo p. musí být vyplněné"
  validates_presence_of :psc,:message=>"Směrovací číslo musí být vyplněné"
  validates_presence_of :email,:message=>"Email nemůže být prázdný"
  validates_presence_of :amount,:message=>"Vyberte částku"

  # Regex to validate an email
  VALID_EMAIL = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/ unless defined? VALID_EMAIL

  validates_format_of :email,    :with => VALID_EMAIL,:message=>"Email má nesprávný formát", :if=>:email?

  after_create :set_variable_number, :send_email

  protected

  def set_variable_number
    self.variable_number = DateTime.now.strftime("%Y%m%d" + self.id.to_s)
    self.save
  end

  def send_email
    begin
      Notification.deliver_fond_registration(self)
    rescue
    end
  end

end
