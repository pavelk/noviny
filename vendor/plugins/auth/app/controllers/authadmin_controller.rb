class AuthadminController < Web::WebController
  before_filter :authorize_admins_only
  layout "web/admin"
  
  def index
    list
    render :action => 'list'
  end
 
  def payments
    @edit_web_user = WebUser.find(params[:web_user_id])
    @payments = Payment.find(:all,:conditions=>{:web_user_id=>params[:web_user_id]},:order=>"created_at DESC")
    render :template=>"/auth/payments"
  end
 
  def edit_payment
    if params[:id]
      @payment = Payment.find(params[:id])
    elsif params[:web_user_id]
      @edit_web_user = WebUser.find(params[:web_user_id])
      @payment = Payment.new
      @payment.web_user = @edit_web_user
    end
    if request.post?
      @payment.status = params[:status]
      @payment.payed_at = nil if params[:payed_at].blank?
      payed_time = params[:payed_time].blank? ? "00:00" : params[:payed_time]
      begin
        @payment.payed_at = DateTime.strptime("#{params[:payed_at]} #{payed_time}","%d.%m.%Y %H:%M")
      rescue
      end
      if @payment.status == Payment::VYTVORENO
        @payment.payed_at = nil
      end
      if @payment.update_attributes(params[:payment])
        flash[:notice] = "Operace provedena úspěšně."
      else
        flash.now[:error] = "Operace nebyla provedena."
        return
      end
      if !params[:expire_date].blank?
        webuser = @payment.web_user
        begin
          webuser.expire_date = DateTime.strptime("#{params[:expire_date]}","%d.%m.%Y")
          webuser.save
        rescue
        end
      end #!params[:expire_date].blank?
      if params[:send_email].to_i == 1
        Notification.deliver_confirm_payment_info(@payment,@app)
      end
      redirect_to :action=>"payments",:web_user_id=>@payment.web_user_id
    end #request.post?
  end
 
  def list
 
    if params[:post] and params[:post][:s]
      @web_users = WebUser.paginate :all, :per_page => 20,:page =>params[:page], :order =>'id desc',
      :conditions => ['login like ? or email like ? or firstname like ? or lastname like ?',
        '%' + params[:post][:s].gsub(/[']/) { '\\'+$& } + '%',
        '%' + params[:post][:s].gsub(/[']/) { '\\'+$& } + '%',
        '%' + params[:post][:s].gsub(/[']/) { '\\'+$& } + '%',
        '%' + params[:post][:s].gsub(/[']/) { '\\'+$& } + '%']
    elsif params[:id]
      @web_users = WebUser.paginate :all, :per_page => 20,:page =>params[:page], :order =>'id desc',
      :conditions => ['domains like ?', '%' + params[:id].gsub(/[']/) { '\\'+$& } + ',%']
    else
      @web_users = WebUser.paginate :all, :per_page => 20,:page =>params[:page], :order =>'id desc'
    end
  end
 
  # Delete the web_user
  def deluser
    if request.xhr?
      @editweb_user = WebUser.find(:first,:conditions => ["id = ?",params[:id]])
      @editweb_user.destroy unless @editweb_user.nil? or params[:id].to_i == 1
    end
    render :nothing=>true
  end
 
  def set_author
    if request.xhr?
      @author = Author.find(params[:author_id])
      render :update do |page|
        page.replace_html "author", :partial=>"authadmin/author"
        page['author_id'].value = @author.id
        #page.replace_html "add_authors", ""
      end
    end
  end  
 
  def edituser
    @newuser = WebUser.find(:first, :conditions => ["id = ?",params[:id]])
    @expire_date = @newuser.expire_date.to_s(:cz_date) if @newuser && @newuser.expire_date
    @author = @newuser.author
    if request.post? and !@newuser.nil?
      @newuser.attributes = params[:newuser]
      if !params[:author_id].blank?
        @author = Author.find(params[:author_id])
        @newuser.author = @author
      else
        @author = nil
        @newuser.author_id = nil
      end
      if !params[:expire_date].blank?
        @expire_date = params[:expire_date]
        @newuser.expire_date = @expire_date.split(".").reverse.join("-")
      else
        @newuser.expire_date = nil
      end
        if @newuser.save
          flash[:notice] = "Údaje byly úspěšně změněny."
          if params[:notify].to_i == 1
            Notification.deliver_admin_newuser(@newuser,params[:newuser][:password], @app, false)
            flash[:notice] << " Uživateli byl poslán email."
          end
          redirect_to :action=>"list"
        else
          flash.now[:error] = "Chyba při ukládání údajů."
          return
        end
    end
  end
 
  # Used to edit domains, add new domain.
  def editdomains
    @newuser = WebUser.find(:first, :conditions => ["id = ?",params[:post][:id]])
    if not @newuser.nil?
      if not params[:post][:domain].nil? and
         params[:post][:domain] =~ WebUser::VALID_DOMAIN and
         params[:post][:domain_level] =~ WebUser::VALID_LEVEL
        #if @editweb_user.domains.has_key?(params[:post][:domain].upcase)
        # flash.now['note'] = "This web_user is already in this domain. Delete it first!"
        #else
        @newuser.domains[params[:post][:domain].upcase] = params[:post][:domain_level]
        if not @newuser.save
          flash.now[:error] = "Chyba při ukládání údajů."
        end
        #end
      else
        flash.now['note'] = "You must enter a domain name using only ASCII"
      end
    end
    render :layout => false
  end
 
  # Used for new web_user
  def newuser
   @newuser = WebUser.new 
  end
 
  # Used to create web_user
  def createuser
    if request.post? 
      @newuser = WebUser.new(params[:newuser])
      @newuser.errors.clear
      if !params[:author_id].blank?
        @author = Author.find(params[:author_id])
        @newuser.author = @author
      else
        @author = nil
        @newuser.author_id = nil
      end
      if !params[:expire_date].blank?
        @expire_date = params[:expire_date]
        @newuser.expire_date = @expire_date.split(".").reverse.join("-")
      else
        @newuser.expire_date = nil
      end
        @newuser.confirmed = true
        @newuser.validkey = nil
        @newuser.domains = WebUser.default_domains
        if @newuser.save
          if params[:post][:notify].to_i == 1
            Notification.deliver_admin_newuser(@newuser,params[:newuser][:password], @app)
            flash[:notice] = "Uživatel byl vytvořen a byl mu poslán email."
          else
            flash[:notice] = "Uživatel byl vytvořen."
          end
          redirect_to authadmin_path
        else
          flash.now[:error] = "Chyba při ukládání údajů."  
          render :action=>"newuser"
        end
    end
  end
 
  # Used to delete a domain
  def deldomain
    if not params[:id].nil?
      id,domain = params[:id].split('-',2)
      @newuser = WebUser.find(:first,:conditions => ["id = ?",id])
      if @newuser.domains.has_key? domain
        if @newuser.login == @web_user.login and (domain == "ADMIN" or domain == "SUPERADMIN")
          flash.now[:error] = "Nemůžete odstranit sebe z této skupiny"
        elsif @newuser.id == 1 and (domain == "ADMIN" or domain == "SUPERADMIN")
          flash.now[:error] = "Nemůžete odstranit tohoto uživatele z této skupiny"
        else
          @newuser.domains.delete(domain)
          if not @newuser.save
            flash.now[:error] = "Chyba při ukládání údajů"
          end
        end
      end
    end
    if request.xhr?
      render :layout => false, :action => "editdomains"
    end
  end
 
protected
 
  # XXX: repeated from ApplicationController!
  def this_auth
    @app
  end
  helper_method :this_auth
 
  def theme_layout
    "../authadmin/theme/#{@app[:themeadmin]}/layout.rhtml"
  end
 
  def authorize_admins_only
    require_auth 'ADMIN'
  end
end