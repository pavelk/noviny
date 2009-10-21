class AuthController < Web::WebController
  layout "web/referendum"
  before_filter :authorize_users_only, :except=>[:index,:login,:signup,:confirm]
 
  def index
    del_location
    @title = "WebUser Interface"
    #redirect_to :action => "login" unless web_user_logged_in?
  end
 
  def remoteinfo
    if request.xhr?
      render :layout=>false
    end
  end
 
  def info
    @newuser = @web_user
    if request.post? and !@newuser.nil?
      if (params[:newuser][:password] == params[:password_conf])
         @newuser.password = params[:newuser][:password] if !params[:newuser][:password].blank? && !params[:password_conf].blank?
        if @newuser.update_attributes(params[:newuser])
          flash.now[:notice] = "Údaje byly úspěšně změněny"
          redirect_to home_path
        else
          flash.now[:error] = "Chyba při ukládání údajů"
          return
        end
      else
        flash.now[:error] = "Hesla nejsou stejná"
      end
    end
  end
 
  def login
    case request.method
    when :post
      if not params[:post].nil?
        web_user = WebUser.authenticate(params[:post][:login], params[:post][:password])
        if web_user
          self.saveSession(web_user, params[:post][:keepalive].to_i)
          flash[:notice] = "Úspěšně přihlášen"
          if web_user.is_admin?
            redirect_to authadmin_path
          else
            redirect_to home_path
          end
          
        else
          flash.now[:error] = "Nesprávné jméno nebo heslo"
          @login = params[:post][:login]
          @err = 2;
          return
        end
      end
    end
  end
 
  def signup
    redirect_to :action=>"index" and return unless @app[:allow_self_registration]
    if request.post?
      @newuser = WebUser.new(params[:newuser])
      @newuser.confirmed = true
      @newuser.confirmed = false if @app[:need_signup_confirmation]
      @newuser.domains = WebUser.default_domains
      @password = params[:newuser][:password]
      @passconf = params[:password_conf]
      @newuser.password = @password
       if @password != @passconf
         flash.now[:error] = "Hesla nesjou stejná!"
         return 
       end
      #return if !@newuser.validate
 
      if @newuser.save
        if WebUser.count == 1
          @newuser.domains = WebUser.default_domains.merge({ "ADMIN" => 1})
          @newuser.save!
        end
        if @app[:need_signup_confirmation]
          Notification.deliver_signup(@newuser, @app) 
          flash['notice'] = "We have sent a message to #{@newuser.email}. "
          flash['notice'] << "Please paste the validation key it includes."
          redirect_to :action=>"confirm"
        else
          redirect_to :action=>"login"
        end
        
      else
        flash.now[:error]  = "Objevila se chyba při registraci."
      end
    else
      @newuser = WebUser.new
      if @web_user and @web_user.ident
        flash.now[:notice]  = "You already have an account and are authentified. Are you sure you want to create a new account ?"
      end
    end
  end
 
  def logout
    if not @web_user
      redirect_to :action => "index"
      return false
    end
    self.cancelSession()
    flash[:notice] = "Úspěšně odhlášen"
    redirect_to home_path
  end
 
  def lostpassword
    if @web_user and @web_user.ident
      @web_user.generate_validkey
      @web_user.save
 
      Notification.deliver_forgot(@web_user, @app)
      flash['notice']  = "Poslali jsme Vám email."
      redirect_to :action => "index" and return
    end
 
    if request.post? and params[:post][:email]
      @newuser = WebUser.find(:first,:conditions => ["email = ?",params[:post][:email]])
      if not @newuser.nil?
        @newuser.generate_validkey
        if @newuser.save
          Notification.deliver_forgot(@newuser, @app)
          flash[:notice]  = "Poslali jsme Vám email."
          redirect_to :action => "login"
        else
          flash[:notice]  = "An error occured while saving informations."
          logger.info "An error occured while saving web_user informations."
        end
      else
        flash[:notice] = "Účet s touto emailovou adresou nenalezen."
      end
    else
      if @web_user
        @email = @web_user.email
      else
        @email = ""
      end
    end
 
 
  end
 
  def reset
    if request.post? and not params[:post].nil?
      @login = params[:post][:login]
    elsif not params[:login].nil?
      @login = params[:login]
    else
      @login = ""
    end
 
    if request.post? and not params[:post].nil?
      @validkey = params[:post][:validkey]
    elsif not params[:validkey].nil?
      @validkey = params[:validkey]
    else
      @validkey = ""
    end
 
    if not params[:id].nil?
      @login,@validkey = params[:id].split(',',2)
    end
 
    # If validation key is wrong, we leave right now
    web_user = WebUser.find(:first,:conditions => ["login = ?",@login])
    if web_user and web_user.validkey != @validkey
      flash[:notice]  = "Your validation key is incorrect, please reask for your password."
      redirect_to :action => "lostpassword" and return
    end
 
    if request.post?
      if params[:post][:password] != params[:post][:passwordconf]
        flash.now[:notice] = "Your passwords don't match!"
      else
        # Dont need this verification, but who knows... :]
        if web_user.validkey == @validkey
          web_user.password = params[:post][:password]
          web_user.confirmed = 1 # Just in case...
          if web_user.errors.count == 0 and web_user.save
            web_user.validkey = nil
            web_user.save
            cookies[:email] = nil
            self.saveSession web_user
            flash[:notice] = "Your password has been changed."
            redirect_to :action => "index" and return
          else
            # There is a problem, we give the view access to this informations
            flash.now['notice'] = "There were an error while saving your new password."
            @newuser = web_user
          end
        end
      end
    end
  end
 
  def confirm
    @email = ""
    if not params[:id].nil?
      @email,validkey = params[:id].split(',',2)
    end
    
    if request.post? and params[:web_user][:validkey]
      validkey = params[:web_user][:validkey]
      @email = params[:web_user][:email]
    end
    
    if not validkey.nil? and not @email.empty?
      web_user = WebUser.find(:first,:conditions=>{:email => @email})
      if not web_user.nil? and web_user.validkey == validkey
        # WebUser is confirming his account
        if not web_user.confirmed?
          web_user.confirmed= 1
          web_user.validkey = nil
 
          if web_user.save
            cookies[:email] = nil
            self.saveSession web_user
            flash['notice'] = "Your account is confirmed."
            redirect_to :action => "index"
          else
            flash['notice'] = "An error occured while saving your account"
          end
        # The web_user is asking for an email address change
        elsif web_user.confirmed? and not web_user.newemail.nil?
          if web_user.class.email_change_isvalid?(web_user.newemail, validkey)
            web_user.email = web_user.newemail
            web_user.newemail = nil
            web_user.validkey = nil
            if web_user.save
              self.saveSession(web_user, @web_user.expire_at)
              flash['notice'] = "Your email has been changed."
              redirect_to :action => "info"
            else
              flash['notice'] = "An error occured while saving your account."
            end
          else
            flash.now['notice'] = "This validation key is incorrect."
          end
        end
      else
        flash.now['notice']  = "This validation key is incorrect. Maybe you already confirmed your account?"
      end
    end
 
    if cookies[:email] and not cookies[:email].nil?
      @email = cookies[:email]
    elsif not params[:web_user].nil? and params[:web_user][:email]
      @email = params[:web_user][:email]
    end
  end
 
 
 
  def denied
    render :layout => false
  end
 
  protected
 
  def saveSession(web_user, keepalive=nil)
    if not keepalive.nil? and keepalive > 0
      if keepalive == 1
        cookies[:web_user] = {
          :value => web_user.sessionstring(60.days.from_now),
          :expires => 60.days.from_now
        }
      else
        cookies[:web_user] = {
          :value => web_user.sessionstring(60.days.from_now),
          :expires => Time.at(keepalive)
        }
      end
    else
      cookies[:web_user] = {
        :value => web_user.sessionstring,
        :expires => nil
      }
    end
  end
 
  def cancelSession
    cookies[:web_user] = nil
    @web_user = WebUser.new
  end
 
   def this_auth
     @app
   end
   helper_method :this_auth
 
   def theme_layout
     "../auth/theme/#{@app[:theme]}/layout.rhtml"
   end
   
  def authorize_users_only
    require_auth 'USERS'
  end
end
