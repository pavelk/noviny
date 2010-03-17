class MailingsController < AuthadminController
  def index
    @mailings = Mailing.all
  end
  
  def show
    @mailing = Mailing.find(params[:id])
  end
  
  def send_by_email
    if request.post?
      @mailing = Mailing.find(params[:id])
      recep = params[:recepients]
      if recep == "temp"
        recepients = TempNewsletter.all
      elsif recep == "news"
        recepients = Newsletter.all_active - @mailing.newsletters
      else
        recepients = []
      end
      recepients.each do |rec|
        begin
          Notification.deliver_mailing(@mailing,rec.email)
          if recep == "temp"
            rec.delete
          elsif recep == "news"
            @mailing.newsletters << rec
          end
        rescue
          logger = Logger.new("#{RAILS_ROOT}/log/mailings.log")
          logger.info rec.email + " " + $!
        end
        sleep(0.25)
      end
      flash[:notice] = "Zpravodaj úspěšně odeslán"
      redirect_to :action=>"show",:id=>@mailing.id
    end
  end
  
  def remote_preview
    if request.xhr?
      mailing = Mailing.new(params[:mailing])
      email = params[:email]
      begin
        Notification.deliver_mailing(mailing,email)
        render :update do |page|
          page.replace_html "preview_info", "Preview bylo posláno na #{email}"
          page.delay(3) do  
             page.replace_html "preview_info", "" 
          end 
        end
      rescue
        render :update do |page|
          page.replace_html "preview_info", "Nastala chyba při posílání emailu na #{email}"
          page.delay(3) do  
             page.replace_html "preview_info", "" 
          end 
        end
      end
    end
  end
  
  def new
    @mailing = Mailing.new
  end
  
  def create
    @mailing = Mailing.new(params[:mailing])
    if @mailing.save
      flash[:notice] = "Zpravodaj vytvořen"
      redirect_to :action=>"show",:id=>@mailing.id
    else
      render :action => 'new'
    end
  end
  
  def edit
    @mailing = Mailing.find(params[:id])
  end
  
  def update
    @mailing = Mailing.find(params[:id])
    if @mailing.update_attributes(params[:mailing])
      flash[:notice] = "Zpravodaj upraven"
      redirect_to :action=>"show",:id=>@mailing.id
    else
      render :action => 'edit'
    end
  end
  
  def destroy
    @mailing = Mailing.find(params[:id])
    @mailing.destroy
    flash[:notice] = "Zpravodaj smazán"
    redirect_to mailings_url
  end
end