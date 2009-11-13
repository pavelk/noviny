class AuthController < Web::WebController
  layout :set_layout
  before_filter :authorize_users_only,
    :only=>[:payments,:pay,:info,:logout]
 
  def pravidla
    @headline = "Diskuse a předplatné v Deníku Referendum"
  end
 
  def create_newsletter
    if request.xhr?
      @newsletter = Newsletter.new(params[:newsletter])
      if @newsletter.save
        render :update do |page|
          page << "jQuery('.activeOverlay').remove()"
          page.replace_html "flash_notice", "Email byl úspěšně zaevidován" 
           page.delay(2) do  
             page.replace_html "flash_notice", "" 
           end  
        end
      else
        render :update do |page|
          page << "jQuery('.activeOverlay').remove()"
          page.replace_html "flash_error",
            content_tag('ul', @newsletter.errors.collect { |err| content_tag('li', err[1]) }),
              'id' => 'errorExplanation', 'class' => 'errorExplanation'
          page.delay(2) do  
             page.replace_html "flash_error", "" 
          end  
         
        end
      end
    end
  end
 
  def payments
    @headline = "Platby"
    @edit_web_user = @web_user
    @payments = Payment.find(:all,:conditions=>{:web_user_id=>@web_user.id},:order=>"created_at DESC")
  end
 
  def pay
    @headline = "Nová platba"
    if request.get?
      @payment = Payment.new()
    elsif request.post?
      @payment = Payment.new(params[:payment])
      @payment.web_user_id = @web_user.id
      if @payment.save
        if @payment.pay_method == "paysec"
          redirect_to :action=>"pay_method",:id=>@payment.id,:autocomplete=>1
        else
          begin
            Notification.deliver_new_payment(@payment,@app)
            Notification.deliver_admin_sign_info(@payment,@app)
          rescue
          end
          redirect_to :action=>"new_payment_info"
        end
      else
        return
      end
    end
  end
  
  def pay_method
    @payment = Payment.find_by_id_and_payed_at(params[:id],nil)
    redirect_to home_path and return unless @payment
    @autocomplete = (params[:autocomplete].to_i == 1)
  end
  
  def confirm_payment
    @headline = "Ověření platby"
    @payment = Payment.find_by_id_and_payed_at(params[:payment_id],nil)
    if (@payment && params[:TId].to_i > 0)
      paysec = PaySec.new
      paysec.VerifyTransactionIsPaid(@payment.variable_symbol,@payment.price)
      if (paysec.success? && @payment.payed_at.nil?)
        @payment.payed_at = Time.now
        @payment.status = Payment::ZAPLACENO_PAYSEC
        @payment.save
        webuser = @payment.web_user
        webuser.confirmed = true
        webuser.set_expire(@payment.price)
        webuser.save
        begin
          Notification.deliver_confirm_payment_info(@payment,@app)
        rescue
        end
        flash.now[:notice] = paysec.customer_info
      end
      flash.now[:error] = paysec.customer_info
    else
      flash.now[:error] = "Platba nenalezena"
    end
  end
  
  def cancel_payment
    @payment = Payment.find(params[:payment_id])
  end
 
  def info
    @headline = "Informace o uživateli"
    @newuser = @web_user
    if request.post? and !@newuser.nil?
        if @newuser.update_attributes(params[:newuser])
          flash.now[:notice] = "Údaje byly úspěšně změněny"
          redirect_to home_path
        else
          flash.now[:error] = "Chyba při ukládání údajů"
          return
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
          flash[:error] = "Nesprávné jméno nebo heslo"
          redirect_to home_path
          return
        end
      end
    end
  end
 
  def signup
    redirect_to :action=>"index" and return unless @app[:allow_self_registration]
    if request.post?
      @newuser = WebUser.new(params[:newuser])
      @newuser.domains = WebUser.default_domains
       if @app[:need_signup_confirmation]
          @newuser.confirmed = false
          @newuser.generate_validkey
        else
          @newuser.confirmed = false
          @newuser.validkey = nil
        end
 
      if (@newuser.valid?)
        if WebUser.count == 1
          @newuser.domains = WebUser.default_domains.merge({ "ADMIN" => 1})
        end
        session[:new_user] = @newuser
        redirect_to :action=>"signup2"
      else
        flash.now[:error]  = "Objevila se chyba při registraci."
      end
    else
      if session[:new_user]
        @newuser = session[:new_user] 
      else
        @newuser = WebUser.new
      end
    end
  end
 
  def signup2
    if request.get?
      if (session[:new_user])
          newuser = session[:new_user] 
      else
          redirect_to :action=>"signup" and return
      end
    end
    if request.post?
      newuser = session[:new_user]
      newuser.save!
      payment = Payment.new(params[:payment])
      payment.web_user_id = newuser.id
      payment.save
      session[:new_user] = nil
      if payment.pay_method == "paysec"
        redirect_to :action=>"pay_method",:id=>payment.id,:autocomplete=>1
      else
        begin
         Notification.deliver_sign_info(payment,@app)
         Notification.deliver_admin_sign_info(payment,@app)
        rescue
        end  
        redirect_to :action=>"signup_info"
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
    @headline = "Ztracené heslo"
    if @web_user and @web_user.ident
      @web_user.generate_validkey
      @web_user.save
      begin
        Notification.deliver_forgot(@web_user, @app)
        flash[:notice]  = "Poslali jsme Vám email."
      rescue
        flash[:error]  = "Nastala chyba v aplikaci."
      end   
      redirect_to home_path and return
    end
 
    if request.post? and params[:post][:email]
      @newuser = WebUser.find(:first,:conditions => ["email = ?",params[:post][:email]])
      if not @newuser.nil?
        @newuser.generate_validkey
        if @newuser.save
          begin
            Notification.deliver_forgot(@newuser, @app)
            flash[:notice]  = "Poslali jsme Vám email."
          rescue
            flash[:error]  = "Nastala chyba v aplikaci."
          end  
          redirect_to home_path and return
        else
          flash[:error]  = "An error occured while saving informations."
          puts @newuser.errors.inspect
          logger.info "An error occured while saving web_user informations."
        end
      else
        flash[:error] = "Účet s touto emailovou adresou nenalezen."
      end
    else
      if @web_user
        @email = @web_user.email
      else
        @email = ""
      end
    end #if request.post?
  end
 
  def reset
    @headline = "Ztracené heslo"
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
    unless web_user
      flash[:error] = "Uživatel nenalezen"
      redirect_to home_path and return
    end
    if web_user and web_user.validkey != @validkey
      flash[:error]  = "Váš validační klíč je neplatný, zkuste prosím znovu zažádat o Vaše heslo."
      redirect_to :action => "lostpassword" and return
    end
 
    if request.post?
      if params[:post][:password] != params[:post][:passwordconf]
        flash.now[:error] = "Hesla nejsou stejná!"
      elsif params[:post][:password].length < 6 
        flash.now[:error] = "Heslo musí mít minimálně 6 znaků"
      else
        # Dont need this verification, but who knows... :]
        if web_user.validkey == @validkey
          web_user.password = params[:post][:password]
          web_user.confirmed = 1 # Just in case...
          if (web_user.errors.count == 0 && web_user.save)
            web_user.validkey = nil
            web_user.save
            cookies[:email] = nil
            self.saveSession web_user
            flash[:notice] = "Vaše heslo bylo změněno."
            redirect_to home_path and return
          else
            # There is a problem, we give the view access to this informations
            flash.now[:error] = "Vyskytla se chyba."
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
    #render :layout => false
  end
 
  protected
 
  def set_layout
    #if action_name == "signup"
      "web/part/auth"
   # else
   #   "web/referendum"
   # end
  end
 
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
