require 'digest/sha1'

# this model expects a certain database layout and its based on the name/login pattern.
class WebUser < ActiveRecord::Base
  belongs_to :author
  has_many :article_comments
  
  has_attached_file :photo,
                    :styles => {
                      :thumb=> "65x65#" },
                    :url  => "/assets/author_pictures/:id/:style/:basename.:extension",
                    :path => ":rails_root/public/assets/author_pictures/:id/:style/:basename.:extension"
                    

  
  # Protecting the fields
  attr_protected  :cryptpassword,
                  :validkey,
                  :created_at,
                  :updated_at,
                  :confirmed,
                  :domains,
                  :payed,
                  :author_id,
                  :expire_date,
                  :photo_file_name,
                  :photo_content_type,
                  :photo_file_size

  # Please change the salt to something else,
  # Every application should use a different one
  @@salt = 'sMre3!Y!yL0q'
  cattr_accessor :salt
  attr_accessor :ident, :expire_at, :password, :passwordbis

  # To the hardcoded USERS,1 you can add a default set of domains for new web_users
  # in the config/auth_generator.yml file.
  def self.default_domains
    { "USERS" => 1 }.reverse_merge!(self.str2domain(@@config[:default_domains]))
  end

  def can_create_comment?(article)
    return true if self.is_admin?
    return true if self.author == article.author
    return ((self.expire_date >= Time.now.to_date) && self.confirmed?)
    return false
  end
  
  def no_info?
    !(show_mail? || show_phone? || show_address? || show_web? || show_skype? || show_twitter? )
  end
  
  # Authenticate a web_user.
  #
  # Example:
  #   @web_user = WebUser.authenticate('bob', 'bobpass')
  #
  def self.authenticate(login, pass)
    find(:first,:conditions => ["login = ? AND cryptpassword = ? AND confirmed=1", login, WebUser.crypt_passwd(login,pass)])
  end

   def can_modify?(comment)
     return true if self.is_admin?
     return true if self.author == comment.article.author
     return true if self == comment.web_user
     return false
   end

  def comment_info
    str = ""
    str += self.firstname if self.firstname
    str += " #{self.lastname}" if self.lastname
    str += ", #{self.city}" if self.city && self.show_address?
    return str
  end

  def full_name
    "#{firstname} #{lastname}"
  end
  
  def address
    "#{street} #{number}, #{city} #{psc}"
  end

  def name
    case @@config[:name_format]
    when 'full'
      name = "#{firstname} #{lastname} <#{email}>" unless firstname.blank? or lastname.blank?
    when 'name'
      name = "#{firstname} #{lastname}" unless firstname.blank? or lastname.blank?
    when 'first'
      name = "#{firstname}" unless firstname.blank?
    when 'last'
      name = "#{lastname}" unless lastname.blank?
    else
      name = "#{login}"
    end
    name = "#{login}" if name.nil?
    name
  end
  
  def in_domain?(domain)
    if domains and !domains.empty?
      return domains.key?(domain.upcase)
    end

    return false
  end

  def is_admin?
    #return in_domain?('ADMIN')
    access_for('ADMIN') > 0
  end

  def access_for(domain)
    domains[domain.upcase].to_i unless not in_domain?(domain) || 0
  end

  def access_granted_for?(credentials, restrict_time = false)
    priv = WebUser.str2domain(credentials.to_s)
    if restrict_time
      return false if time_restricted? and over_hours?
    end
    priv.each { |dom, req|
      if req == 0 and in_domain?(dom); return false; end
      if req > 0 and access_for(dom) < req; return false; end
    }
    return true
  end
  alias_method :acl?, :access_granted_for?

  # Time restriction
  def access_granted_now_for?(credentials)
    access_granted_for?(credentials, true)
  end
  alias_method :tacl?, :access_granted_now_for?


  # Set the config environment
  def self.config(app)
    @@config ||= app
  end

  # The 2 functions below allow you to save all the authentification part in a cookie.
  # It prevents you to make a database access to verify if the web_user is connected.
  #
  # If you need to add something in the cookie, check the lines carefuly
  def self.fromString(string)
     # If you add something in the cookie, increment the number
    p = string.split(":",8)

    login = p[0]
    # if you add something in the cookie, add a p[num]
    chaine = "#{p[0]}:#{p[1]}:#{p[2]}:#{p[3]}:#{p[4]}:#{p[5]}:#{p[6]}"
    # If you add something in the cookie, increment the p[num]
    maxtime = p[5].to_i
    crypted = WebUser.sha1(chaine)
      # If you add something in the cookie, increment the p[num]
    if crypted == p[7]
      params = { :login => p[0], :firstname => p[2], :lastname => p[3], :email => p[1] }
      web_user = WebUser.new(params)
      if maxtime > Time.new.to_i
        web_user.ident = true
        web_user.domains = WebUser.str2domain(p[4])
        web_user.expire_at = p[5].to_i
        return web_user.reload
      else
        web_user.ident = false
      end
      return web_user
    else
      return nil
    end
  end

  # The default time for the session
  def sessionstring(expire_at=1.hours.from_now)
    session_id = AuthHelper::Utils::random_string(32)
    dom = WebUser.domain2str(self.domains)
    # If you add something in the cookie, put it here :)
    chaine = "#{login}:#{email}:#{firstname}:#{lastname}:#{dom}:#{expire_at.to_i}:#{session_id}"
    crypted = WebUser.sha1(chaine)
    "#{chaine}:#{crypted}"
  end

  # Before creating, we generate a validkey.
  # This is used for confirmation
  def generate_validkey(from_string = nil)
    from_string ||= AuthHelper::Utils::random_string(30)
    write_attribute "validkey", WebUser.sha1(from_string)
  end

  # Check if the validkey is ok.
  def self.email_change_isvalid?(email, validkey)
     WebUser.sha1(email) == validkey
  end

# To set the password, but we store it crypted...
#  def password=(new_password)
#    if new_password.length >= 6
#      write_attribute "cryptpassword", WebUser.sha1(new_password)
#    else
#      errors.add('password','must be at least 6 characters long!')
#      return nil
#    end
#  end

  def reload
    # Just to be sure we have all the fields
    u = WebUser.find(:first,:conditions => ["login = ? AND confirmed=1", self.login])
    self.validkey = u.validkey
    self.ident = true
    self.id = u.id
    u.ident = true
    return u
  end

  protected

  # Apply SHA1 encryption to the supplied string.
  def self.sha1(chaine)
    Digest::SHA1.hexdigest("#{salt}--#{chaine}--")
  end

  before_validation_on_create :set_default_fields
  before_create :generate_validkey
  before_save :hash_domains
  before_save :hash_password
  after_save :after_find

  #after_find :dehash_domains

  # Before saving the record to database we will base64encode the domains the
  # web_users belongs to
  def hash_domains
    # TODO : do we really want that?
    if self.domains.nil? or self.domains.empty? or self.domains.length < 1
      self.domains = self.default_domains
    end
    write_attribute "domains", WebUser.domain2str(self.domains)
  end

  def self.crypt_passwd(login,pass)
    # default is sha1
    if @@config.nil? or not @@config.include? 'crypt_method'
      return WebUserPasswordCryptSHA.crypt(login,pass)
    else
      WebUserPasswordCrypt.subclasses.each do |klass|
        if klass.type == @@config['crypt_method']
          return klass.crypt(login,pass)
        end
      end
    end
  end

   def check_password
     unless WebUser.valid_password?(password)
       #errors.add('password','must be at least 6 characters long.')
#     if password.nil? or password.empty?
#       errors.add('password','must be present')
     end
   end

   def validate_on_create(*methods, &block)
     check_password
   end

  def self.valid_password?(str)
    not str.nil? and str.length >= 6
  end

  def hash_password
    if WebUser.valid_password?(password)
      write_attribute "cryptpassword", WebUser.crypt_passwd(login,password)
    elsif not password.nil?
     # errors.add('password','must be at least 6 characters long!: #{password}')
    elsif cryptpassword.nil?
      errors.add('password','must be present')
    else
      # we have an encrypted password already
    end
  end

  # After we load the web_user
  def after_find
    #require 'base64'
    #self.domains = Marshal.load(Base64.decode64(self.domains))
    self.domains = WebUser.str2domain(self.domains) if self.domains.is_a?(String)
    #self.domains = WebUser.domain2str(self.domains) if self.domains.is_a?(Hash)
  end

  #before_update :crypt_unless_empty

  # If the record is updated we will check if the password is empty.
  # If its empty we assume that the web_user didn't want to change his
  # password and just reset it to the old value.
  def crypt_unless_empty
    if password and password.empty?
      web_user = WebUser.find(self.id)
      self.password = web_user.password
    else
      #write_attribute "password", WebUser.sha1(password)
    end
  end

  # Convert the domains hash to a string
  # Ensure that the domains contain at least USERS,1
  def self.domain2str(dom)
    dom = WebUser.str2domain(dom) unless dom.is_a? Hash
    dom.reverse_merge!(self.default_domains)
    { "USERS" => 1 }.reverse_merge(dom).collect { |name, level| "#{name},#{level}" }.join(' ')
  end

  # Convert domains string to a hash
  def self.str2domain(str)
    result = {}
    return result if str.nil? or str.empty?
    str.split(' ').each { |b|
      name, value = b.split(',',2)
      result[name]= value.nil? ? 1 : value.to_i
    }
    result
  end

## == Model Validation ================================================

  # Set default fields to ensure correct values at creation time
  #
  # login, password and email are provided by the web_user
  # ipaddr is set in the controller
  # confirmed may be 1 if created by an admin
  # time access is disabled by default (change allow_* in your subclass
  #                                             to allow other defaults)
  # all other fields are blank by default (except domains)
  def set_default_fields
    self.confirmed ||= false
  end

  # Regex to validate an email
  VALID_EMAIL = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/ unless defined? VALID_EMAIL
  # Regex to validate a login
  VALID_LOGIN = /^[A-Za-z][A-Za-z0-9\-\_]{2,39}$/ unless defined? VALID_LOGIN
  # Regex to validate firstname and lastname
  VALID_NAME  = /^[\w0-9\-\s]{0,40}$/ unless defined? VALID_NAME
  # Regex to validate time string
  VALID_TIME  = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ unless defined? VALID_TIME
  # Regex to validate a domain
  VALID_DOMAIN = /^\w+$/i unless defined? VALID_DOMAIN
  # Regex to validate a level
  VALID_LEVEL  = /^\d+$/ unless defined? VALID_LEVEL

  validates_presence_of :login,:message=>"Login nemůže být prázdný"
  validates_presence_of :email,:message=>"Email nemůže být prázdný"

  validates_uniqueness_of :login, :on => :create,:message=>"Tento login již existuje"
  validates_uniqueness_of :login, :on => :update,:message=>"Tento login již existuje"
  validates_uniqueness_of :email, :on => :create,:message=>"Tento email již existuje"
  validates_uniqueness_of :email, :on => :update,:message=>"Tento email již existuje"

  #validates_confirmation_of :password
  validates_format_of :login, :with => VALID_LOGIN,:message=>"Login má nesprávný formát"

  validates_length_of :password, :on => :create, :minimum => 6, :allow_nil => true,:message=>"Heslo musí mít minimálně 6 znaků"

  validates_length_of :email,    :maximum => 100
  validates_format_of :email,    :with => VALID_EMAIL,:message=>"Email má nesprávný formát"

  validates_length_of :validkey, :maximum => 40, :allow_nil => true

  validates_format_of :firstname, :with => VALID_NAME,:message=>"Jméno má nesprávný formát"
  validates_format_of :lastname,  :with => VALID_NAME,:message=>"Příjmení má nesprávný formát"

  validates_inclusion_of :confirmed, :in => [true, false]

  validates_each(:domains) do |record, attr, value|
    value.each do | key, val |
      record.errors.add(attr, "contain invalid domain #{key.inspect}") unless key =~ VALID_DOMAIN
      record.errors.add(attr, "contain invalid access level #{val.inspect} ") unless "#{val}" =~ VALID_LEVEL
    end
  end

end


### Theses class are used for the password crypting. You can change them, add some, etc.
### To change the crypt method, add a class and herit from WebUserPasswordCrypt.
### See examples.

class WebUserPasswordCrypt
  def self.inherited(child) #:nodoc:
    @@subclasses ||= []
    @@subclasses << child
    super
  end

  def self.subclasses
    @@subclasses
  end
end

require 'digest/sha1'
class WebUserPasswordCryptSHAMoreSalted < WebUserPasswordCrypt

  def self.crypt(login,pass)
    Digest::SHA1.hexdigest("#{login}#{pass}")
  end

  def self.type
    "SHA1moresalt"
  end
end

class WebUserPasswordCryptSHA < WebUserPasswordCrypt
  def self.crypt(login,pass)
    Digest::SHA1.hexdigest(pass)
  end

  def self.type
    "SHA1"
  end
end

class WebUserPasswordCryptMD5 < WebUserPasswordCrypt
  def self.crypt(login,pass)
    Digest::MD5.hexdigest(pass)
  end

  def self.type
    "MD5"
  end
end
