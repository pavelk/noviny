class Notification < ActionMailer::Base
  def forgot(web_user, app, sent_on = Time.now)
    @recipients = "#{web_user.login} <#{web_user.email}>"
    @from       = "#{app[:title]} Admin <#{app[:email]}>"
    @subject    = 'Password Reminder'
    @body       = {'web_user' => web_user, 'app' => app}
    @sent_on    = sent_on
  end

  def signup(web_user, app, sent_on = Time.now)
		@recipients = "#{web_user.login} <#{web_user.email}>"
		@from       = "#{app[:title]} Admin <#{app[:email]}>"
		@subject    = 'You requested for an account'
		@body       = {'web_user' => web_user, 'app' => app}
		@sent_on    = sent_on
  end
  
  def emailchange (web_user, app, sent_on = Time.now)
     @recipients = "#{web_user.login} <#{web_user.email}>"
     @from       = "#{app[:title]} Admin <#{app[:email]}>"
     @subject    = 'Email change'
     @body       = {'web_user' => web_user, 'app' => app}
     @sent_on    = sent_on
  end

	def admin_new_user (web_user, password, app, new_user = true, sent_on = Time.now)
     @recipients = "#{web_user.login} <#{web_user.email}>"
     @from       = "#{app[:title]} Admin <#{app[:email]}>"
     @subject    = 'New account'
     @body       = {'web_user' => web_user, 'password' => password, 'app' => app,'new_us' => new_user}
     @sent_on    = sent_on
	end
end
