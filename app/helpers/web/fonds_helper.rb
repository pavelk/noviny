module Web::FondsHelper

  def error_messages_for(object_name, options = {})
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

end
