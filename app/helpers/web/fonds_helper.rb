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
    return "#{sum},- Kč"
  end

end
