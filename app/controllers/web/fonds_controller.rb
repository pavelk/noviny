class Web::FondsController < Web::WebController

  layout "web/gallery"

  def show
    amount_table
    @fond = Fond.new(params[:fond])
  end


  def amounts_saved(amount)
    return ReallyFond.count(:conditions => [ "MONTH(date) = ? AND amount = ?", Date.today.month, amount ], :joins => "INNER JOIN fonds ON fonds.id = really_fonds.fond_id" )
  end

  def amount_table
    @amount = Hash.new

    @amount[:total] = ReallyFond.sum(:amount, :conditions => [ "MONTH(date) = ?", Date.today.month ], :joins => "INNER JOIN fonds ON fonds.id = really_fonds.fond_id" )
    @amount[:total] += params[:amount] if params[:amount]

    [100,300,1000,3000,10000,30000].each do |t|
      @amount["saved_#{t}".intern] = amounts_saved(t)
      @amount["need_#{t}".intern] = ( 300000 - @amount[:total].to_i ) / t
    end

    if request.xhr?
      @amount["saved_#{params[:amount]}".intern] += 1
      render :partial => "amount_table", @object => @amount
    else
      render :layout => nil
    end
  end

end
