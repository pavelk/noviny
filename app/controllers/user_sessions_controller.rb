class UserSessionsController < ApplicationController
  
  skip_before_filter :check_authentication, :except => :destroy
  
  def new 
   @user_session = UserSession.new
  end

  def create
   @user_session = UserSession.new(params[:user_session])
   if @user_session.save
     flash[:notice] = "Úspěšné přihlášení!"
     redirect_back_or_default root_url
   else
     render :action => :new
   end
  end

  def destroy
   current_user_session.destroy
   flash[:notice] = "Úspěšné odhlášení!"
   redirect_back_or_default new_user_session_url
  end
  
end