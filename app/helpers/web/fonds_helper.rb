module Web::FondsHelper

  def error_messages_for1(object_name, options = {})
    options = options.symbolize_keys
    object = instance_variable_get("@#{object_name}")
    if object && !object.errors.empty?
      errs = []
      object.errors.each do |er|
        errs << [er[0],er[1]]
      end
      errs = errs.sort{|x,y| Fond::FIELDS[x[0].to_sym] <=> Fond::FIELDS[y[0].to_sym] }
      return content_tag('div',
        content_tag(options[:header_tag] || 'h3', "There are following errors in the form:"[:error_header]) +
          content_tag('ul', errs.collect { |err| content_tag('li', err[1]) }),
            'id' => options[:id] || 'errorExplanation', 'class' => options[:class] || 'errorExplanation'
          )
    else
      ""
    end
  end

  def error_messages_for2(object_name, options = {})
    options = options.symbolize_keys
    object = instance_variable_get("@#{object_name}")
    if object && !object.errors.empty?
      errs = []
      object.errors.each do |er|
        errs << [er[0],er[1]]
      end
      errs = errs.sort{|x,y| ReallyFond::FIELDS[x[0].to_sym] <=> ReallyFond::FIELDS[y[0].to_sym] }
      return content_tag('div',
        content_tag(options[:header_tag] || 'h3', "There are following errors in the form:"[:error_header]) +
          content_tag('ul', errs.collect { |err| content_tag('li', err[1]) }),
            'id' => options[:id] || 'errorExplanation', 'class' => options[:class] || 'errorExplanation'
          )
    else
      ""
    end
  end

  def morals(fond)
    my_really_fond = ReallyFond.find(:first, :conditions => {:fond_id => fond.id}, :order => 'date desc')
    my_fond = Fond.find(fond.id)

    if my_really_fond.nil?
      if my_fond.disable
        return "Nenastartovaný"
      elsif my_fond.created_at < DateTime.now - 2.months
        return "<font color='red'>Více jak dva měsíce bez odezvy</font>"
      elsif my_fond.created_at < DateTime.now - 1.month
        return "<font color='blue'>Více jak měsíc bez odezvy</font>"
      else
        return "<font color='green'>OK</font>"
      end
    else
      if my_fond.disable
        return "Bývalý přispěvatel"
      elsif my_really_fond.date < DateTime.now - 4.months
        return "<font color='red'>Více jak čtyři měsíce bez platby</font>"
      elsif my_really_fond.date < DateTime.now - 3.months
        return "<font color='orange'>Více jak tři měsíce bez platby</font>"
      elsif my_really_fond.date < DateTime.now - 2.months
        return "<font color='orange'>Více jak dva měsíce bez platby</font>"
      else
        return "<font color='green'>OK</font>"
      end
    end
  end

  # Celková suma všech aktivních trvalých příkazů

  def sum_active_tax_returns
    r_fonds = ReallyFond.find(:all, :group => :fond_id, :select => "fond_id" )
    sum = Fond.sum(:amount, :conditions => [
      "disable = false and id in (?)", r_fonds.map { |f| f.fond_id } ])
    return "#{sum > 3000 ? sum.to_i.to_s.insert(-4,".") : sum},-&nbsp;Kč"
  end

  # - kontrola jestli uzivatel s danou IP jiz je registrovan
  # - pokud neni, kontrola jestli uz uzivatel byl na strankach
  # - pokud okno vyskocilo pred vice jak 7 dny, tak vyskoci znovu
  # - jinak nic
  # - return true, kdyz ma vyskocit
  # - return false, kdyz nema vyskocit

  def check_popup
    if ip = request.env['HTTP_X_FORWARDED_FOR']
    else
      ip = request.remote_ip
    end
    if ip
      # je uzivatel jiz registrovan? pokud ano, vrat false = nezobraz popup
      if Fond.find_by_ip_address(ip)
        return false
      # navstivil uzivatel web s tuto IP adresou?
      elsif user = PopupFond.find_by_ip_address(ip)
        # pokud ano, bylo to vice nez pred sedmi dny?
        if ( user.last_view_popup + 7.days ) > DateTime.now
          return false
        # pokud to bylo vice nez pred sedmi dny, zobraz popup
        else
          user.last_view_popup = DateTime.now
          user.save
          return true
        end
      # jedna se o noveho navstevnika
      else
        PopupFond.create(:last_view_popup => DateTime.now, :ip_address => ip)
        return true
      end
    else
      return false
    end
  end

end
