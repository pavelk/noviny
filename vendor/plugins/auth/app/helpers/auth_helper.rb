module AuthHelper
  def spinner_tag(id = 'ident')
    image_tag('spinner.gif', :id=>"#{id}_spinner", :align => 'middle', :border=> 0, :style=> 'display: none;', :alt => 'loading...' )
  end
  
  def error_messages_for(object_name, options = {})
    options = options.symbolize_keys
    object = instance_variable_get("@#{object_name}")
    if object && !object.errors.empty?
      return content_tag('div',
        content_tag(options[:header_tag] || 'h3', "There are following errors in the form:"[:error_header]) +
          content_tag('ul', object.errors.collect { |err| content_tag('li', err[1]) }),
            'id' => options[:id] || 'errorExplanation', 'class' => options[:class] || 'errorExplanation'
          )
    else
      ""
    end
  end
  
  # For theme support. Idea from Typo.
  def search_paths(path)
  #  ["#{path}/theme/#{this_auth[:theme]}/",
  #  ]
  end

  def full_template_path(template_path, extension)
    template_path_dirs = template_path.split('/')
    dir = template_path_dirs[0]
    template_path_dirs.shift
    file = template_path_dirs.join('/')
  #  search_paths(dir).each do |path|
  #    themed_path = File.join(@base_path, path, "#{file}.#{extension}")
  #    return themed_path if File.exist?(themed_path)
  #  end
    super
  end

  # Taken from the webrick server
  module Utils
    if !const_defined? "RAND_CHARS"
      RAND_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "0123456789" +
      "abcdefghijklmnopqrstuvwxyz"
    end
    def random_string(len)
      rand_max = RAND_CHARS.size
      ret = ""
      len.times{ ret << RAND_CHARS[rand(rand_max)] }
      ret
    end
    module_function :random_string

    # define a regexp for valid IPv4 host
    def valid_ipv4_host_regex
      zero_to_254 = "([0-9][0-9]?|1[0-9]{2}|2[0-4][0-9]|25[0-4])"
      one_to_254  = "([1-9][0-9]?|1[0-9]{2}|2[0-4][0-9]|25[0-4])"

      /\A#{one_to_254}\.#{zero_to_254}\.#{zero_to_254}\.#{one_to_254}\z/
    end
    module_function :valid_ipv4_host_regex

  end

  # Show web_user informations using Ajax. Can be used on static pages / cached pages.
  def ajax_account_infos()
    txt = render(:partial => "auth/remotelogin", :layout => 'auth')
    "" + javascript_tag('function showloginform() {'+ update_element_function("accountinfo", :content => txt) +
        ' document.getElementById(\'post_login\').focus();}') + "<!-- account info --> <div id=\"accountinfo\">"+
        link_to(auth_icon('buddy'), auth_url) + "</div>" +
        javascript_tag("new Ajax.Updater('accountinfo', '/auth/remoteinfo', {asynchronous:true});")
  end

  # Show web_user information, don't use for static or cached page!
  def account_infos()
    txt = render(:partial => "auth/remotelogin", :layout => 'auth')
    "" + javascript_tag('function showloginform() {'+ update_element_function("accountinfo", :content => txt) +
    ' document.getElementById(\'post_login\').focus();}') + "<!-- account info --> <div id=\"accountinfo\">"+
    render(:partial => "auth/remoteinfo", :layout => 'auth') + "</div>"
  end

  # Javascript version to show web_user information. Can be used on static pages / cached pages.
  def js_account_infos()
    txt = render(:partial => "auth/remotelogin", :layout => 'auth')
    "" + javascript_tag('function showloginform() {'+ update_element_function("accountinfo", :content => txt) +
    ' document.getElementById(\'post_login\').focus();}') + "<!-- account info --> <div id=\"accountinfo\">" +
    "<script src=\"/auth/jsinfo\" type=\"text/javascript\"></script>"+
    '<script type="text/javascript">displayAccountInfo();</script>' + "</div>"
  end

  # store current uri in the ccokies
  # we can return to this location by calling return_location
  def store_location
    cookies[:return_to] = {:value => request.request_uri, :expires => nil }
  end

  # auth_generator's images tags
  def auth_icon(name)
    image_tag("auth/#{name}.png", :align => 'absmiddle', :border => 0, :alt => name)
  end

  # image tag for web_user
  def web_user_icon(web_user)
    if @app[:gravatar] == true
      site_url = @app[:url].chomp('/')
      default = html_escape "#{site_url}#{@app[:default_icon]}"
      url = "http://www.gravatar.com/avatar.php?gravatar_id=#{Digest::MD5.hexdigest(web_user.email)}&size=#{@app[:icon_size]}&default=#{default}"
      image_tag(url, :align => 'absmiddle', :width => @app['icon_size'], :border => 0, :alt => 'icon for ' + web_user.name)
    elsif !web_user.image.blank?
      image_tag(auth_url(:action => 'image', :id => web_user.login + '.png'), :align => 'absmiddle', :border => 0, :alt => 'icon for ' + web_user.name)
    else
      auth_icon('buddy')
    end
  end

  def web_user_logged_in?
    not @web_user.nil? and @web_user.ident == true
  end


end
