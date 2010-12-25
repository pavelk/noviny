class Web::FondsController < Web::WebController

  layout :set_layout

  before_filter :authorize_admins_only, :only => [ :list ]

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

  def amounts_saved(amount)
    return ReallyFond.count(:conditions => [ "MONTH(date) = ? AND really_fonds.amount = ?", Date.today.month, amount ] )
  end

# ............................................................................ #

  def amount_table
    @amount = Hash.new

    @amount[:total] = ReallyFond.sum(:amount, :conditions => [ "MONTH(date) = ?", Date.today.month ] )
    @amount[:total] += params[:amount].to_i if params[:amount]

    [100,300,1000,3000,10000,30000].each do |t|
      @amount["saved_#{t}".intern] = amounts_saved(t)
      @amount["need_#{t}".intern] = ( 300000 - @amount[:total].to_i ) / t
    end

    if request.xhr?
      @amount["saved_#{params[:amount]}".intern] += 1
      render :partial => "amount_table", @object => @amount
    else
      #render :layout => nil
    end
  end

# ............................................................................ #

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
                            :conditions => [conds] )
    else
      @fonds = Fond.paginate(:all, :order => "created_at desc", :page => params[:page] )
    end

  end

# ............................................................................ #

  def detail
    @user = Fond.find_by_id(params[:id])
    @my_really_fonds = ReallyFond.find_all_by_fond_id(params[:id])

    if request.post?
      @really_fonds = ReallyFond.new(params[:really_fonds])
      @date = params[:date]
      @really_fonds[:date] = DateTime.strptime("#{params[:date]}","%d.%m.%Y") unless params[:date].blank?
      if @really_fonds.save
        flash.now[:notice] = "Nová platba úspěšně uložena"
        @date = ""
        @really_fonds = ReallyFond.new
        redirect_to :action => :detail
      else
        flash.now[:error] = "Během ukládání nové platby se vyskytla chyba."
      end
    else
      @really_fonds = ReallyFond.new
    end
  end

# ............................................................................ #

  protected

  def authorize_admins_only
    require_auth "ADMIN"
  end

  def set_layout
    if params[:action] == "list" or params[:action] == "detail"
      "web/admin"
    else
      "web/gallery"
    end
  end
end
