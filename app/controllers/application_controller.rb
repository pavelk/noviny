class ApplicationController < ActionController::Base

  helper :all
  helper_method :current_user_session, :current_user
  filter_parameter_logging :password, :password_confirmation

  before_filter :check_authentication
  before_filter :mailer_set_url_options


  def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_user_session && current_user_session.record
  end
  
  private
    
    def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
    end
=begin    
    def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.record
    end
=end    
    def check_authentication
      unless current_user
        store_location
        flash[:error] = "Musíte se přihlásit pro přístup na tuto stránku."
        redirect_to new_user_session_url
        return false
      end  
    end   
    
    def store_location
      session[:return_to] = request.request_uri
    end
    
    def redirect_back_or_default(default)
      redirect_to(session[:return_to] || default)
      session[:return_to] = nil
    end
    
    def mailer_set_url_options
      ActionMailer::Base.default_url_options[:host] = request.host_with_port
    end


rescue_from Exception, :with => :rescue_all_exceptions if RAILS_ENV == 'production'

def rescue_all_exceptions(exception)
  case exception
    when ActiveRecord::RecordNotFound
      render :text => "The requested resource was not found", :status => :not_found
    when ActionController::RoutingError, ActionController::UnknownController, ActionController::UnknownAction
      render :text => "Invalid request", :status => :not_found
    else
      EXCEPTION_LOGGER.error( "\nWhile processing a #{request.method} request on #{request.path}\n
      parameters: #{request.parameters.inpect}\n
      #{exception.message}\n#{exception.clean_backtrace.join( "\n" )}\n\n" )
      render :text => "An internal error occurred. Sorry for inconvenience", :status => :internal_server_error
  end
end


end



