class Web::FondsController < Web::WebController

  layout :set_layout

  before_filter :authorize_admins_only, :except => [ :show, :amount_table ]

# ............................................................................ #

  def show
    amount_table
    if request.post?
      @fond = Fond.new(params[:fond])
      if @fond.save
        flash.now[:notice] = "Děkujeme, na Vaši mailovou adresu právě " \
          "odešel dopis s variabilním symbolem pro Váš trvalý příkaz."
        @fond = Fond.new
      else
        flash.now[:error] = "Při ukládání formuláře se objevila chyba."
      end
    else
      @fond = Fond.new
    end
  end


# ............................................................................ #

  # Pocet aktivních trvalých příkazů

  def count_active_tax_returns(amount)
    joins = "LEFT JOIN `fonds` ON `fonds`.id = `really_fonds`.fond_id"
    fond = ReallyFond.find(:all, :joins => joins, :group => :fond_id,
      :conditions => [ "fonds.disable = false AND fonds.amount = ?", amount ] )
    return fond.count
  end

# ............................................................................ #

  # Celková suma všech aktivních trvalých příkazů

  def sum_active_tax_returns
    r_fonds = ReallyFond.find(:all, :group => :fond_id, :select => "fond_id" )
    return Fond.sum(:amount, :conditions => [
      "disable = false and id in (?)", r_fonds.map { |f| f.fond_id } ])
  end


# ............................................................................ #

  def amount_table
    @amount = Hash.new

    # Celkem nasporeno tento mesic
    @amount[:total] = sum_active_tax_returns
    @amount[:total] += params[:amount].to_i if params[:amount]

    [60,100,300,600,1000,3000,6000,10000,30000].each do |t|
      @amount["saved_#{t}".intern] = count_active_tax_returns(t)
      @amount["need_#{t}".intern] = ( 300000 - @amount[:total].to_i ) / t
      (( 300000 - @amount[:total].to_i ) % t ) == 0 ? nil : @amount["need_#{t}".intern] += 1
      @amount["need_#{t}".intern] < 0 ? @amount["need_#{t}".intern] = 0 : nil
    end

    if request.xhr?
      @amount["saved_#{params[:amount]}".intern] += 1
      render :partial => "amount_table", @object => @amount
    else
      #render :layout => nil
    end
  end

# ............................................................................ #

  def update_fond_morals
    fond = Fond.find_by_id(params[:id])
    fond.disable = !fond.disable
    fond.save
    render :partial => 'morals', :locals => { :fond => fond }
  end
# ............................................................................ #

  # Uzivatele, kteri pouze vyplnili formular

  def list

    unless params[:search_fonds].nil?
      fonds = params[:search_fonds]
      @year = fonds[:year]
      @month = fonds[:month]
      @variable_number = fonds[:variable_number]
      @email = fonds[:email]

      conds = []
      conds << "fonds.email = '#{fonds[:email]}'" unless fonds[:email].blank?
      conds << "fonds.variable_number = '#{fonds[:variable_number]}'" unless fonds[:variable_number].blank?
      conds << "YEAR(created_at) = #{fonds[:year]}" unless fonds[:year].blank?
      conds << "MONTH(created_at) = #{fonds[:month]}" unless fonds[:month].blank?
      conds = conds.join(" AND ")

      @fonds = Fond.paginate(:all, :order => "created_at desc", :page => params[:page],
                            :conditions => [conds], :per_page => 1000 )
    else
      @fonds = Fond.paginate(:all, :order => "created_at desc", :page => params[:page] )
    end

  end

# ............................................................................ #

  # Skutecne provedene platby

  def really_list

    joins = "INNER JOIN `fonds` ON `fonds`.id = `really_fonds`.fond_id"
    select = "really_fonds.*, fonds.email, fonds.variable_number"

    unless params[:search_fonds].nil?
      fonds = params[:search_fonds]
      @year = fonds[:year]
      @month = fonds[:month]
      @variable_number = fonds[:variable_number]
      @email = fonds[:email]

      conds = []
      conds << "fonds.email = '#{fonds[:email]}'" unless fonds[:email].blank?
      conds << "fonds.variable_number = '#{fonds[:variable_number]}'" unless fonds[:variable_number].blank?
      conds << "YEAR(date) = #{fonds[:year]}" unless fonds[:year].blank?
      conds << "MONTH(date) = #{fonds[:month]}" unless fonds[:month].blank?
      conds = conds.join(" AND ")

      @fonds = ReallyFond.paginate(:all, :order => "really_fonds.created_at desc", :page => params[:page],
        :conditions => [conds], :joins => joins, :select => select, :order => "date desc", :per_page => 1000 )
    else
      @fonds = ReallyFond.paginate(:all, :order => "really_fonds.created_at desc",
        :page => params[:page], :joins => joins, :select => select, :order => "date desc" )
    end

  end

# ............................................................................ #

  def detail
    @user = Fond.find_by_id(params[:id])
    @my_really_fonds = ReallyFond.find_all_by_fond_id(params[:id], :order => "date DESC")

    if request.post?
      @really_fonds = ReallyFond.new(params[:really_fonds])
      @date = params[:date]
      @really_fonds[:date] = DateTime.strptime("#{params[:date]}","%d.%m.%Y") unless params[:date].blank?
      if @really_fonds.save
        flash[:notice] = "Nová platba úspěšně uložena."
        @date = ""
        @really_fonds = ReallyFond.new
        redirect_to fond_detail_path(@user.id)
      else
        flash.now[:error] = "Během ukládání nové platby se vyskytla chyba."
      end
    else
      @really_fonds = ReallyFond.new
    end
  end

# ............................................................................ #

  def edit_detail
    @fond = Fond.find_by_id(params[:id])

    if request.post?
      if @fond.update_attributes(params[:fond])
        flash.now[:notice] = "Úspěšně uloženo."
        redirect_to :action => :detail, :id => @fond.id
      else
        flash.now[:error] = "Při ukládání formuláře se objevila chyba."
      end
    end

  end

# ............................................................................ #

  def delete_really_fond

    fond = ReallyFond.find(params[:id])
    detail_id = fond.fond_id
    fond.destroy
    flash[:notice] = "Platba úspěšně smazána."
    redirect_to fond_detail_path(detail_id)

  end

# ............................................................................ #

  def edit_really_fond

    @really_fonds = ReallyFond.find(params[:id])
    @date = @really_fonds.date.to_s(:cz_date)
    @user = Fond.find_by_id(@really_fonds.fond_id)

    if request.post?
      @date = params[:date]
      params[:really_fonds][:date] = DateTime.strptime("#{params[:date]}","%d.%m.%Y") unless params[:date].blank?
      if @really_fonds.update_attributes(params[:really_fonds])
        flash[:notice] = "Platba úspěšně editovaná."
        redirect_to fond_detail_path(@user.id)
      else
        flash.now[:error] = "Během ukládání platby se vyskytla chyba."
      end
    end

  end

# ............................................................................ #

  protected

  def authorize_admins_only
    require_auth "ADMIN"
  end

  def set_layout
    if params[:action] ==  "show"
      "web/gallery"
    else
      "web/admin"
    end
  end
end
