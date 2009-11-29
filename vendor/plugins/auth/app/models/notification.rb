class Notification < ActionMailer::Base
  def forgot(web_user, app, sent_on = Time.now)
    @recipients = "#{web_user.login} <#{web_user.email}>"
    @from       = "#{app[:title]} <#{app[:email]}>"
    @subject    = 'Password Reminder'
    @body       = {'web_user' => web_user, 'app' => app}
    @sent_on    = sent_on
    content_type "text/html"
  end

  def signup(web_user, app, sent_on = Time.now)
		@recipients = "#{web_user.login} <#{web_user.email}>"
		@from       = "#{app[:title]} <#{app[:email]}>"
		@subject    = 'You requested for an account'
		@body       = {'web_user' => web_user, 'app' => app}
		@sent_on    = sent_on
  end
  
  def emailchange (web_user, app, sent_on = Time.now)
     @recipients = "#{web_user.login} <#{web_user.email}>"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Email change'
     @body       = {'web_user' => web_user, 'app' => app}
     @sent_on    = sent_on
  end

	def admin_newuser (web_user, password, app, new_user = true, sent_on = Time.now)
     @recipients = "#{web_user.login} <#{web_user.email}>"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Nová registrace'
     @body       = {'web_user' => web_user, 'password' => password, 'app' => app,'new_us' => new_user}
     @sent_on    = sent_on
     content_type "text/html"
	end
  
   def sign_info(payment, app, sent_on = Time.now)
     @recipients = "#{payment.web_user.full_name} <#{payment.web_user.email}>"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Nová registrace'
     @body       = {'payment' => payment,'app' => app}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def new_payment(payment, app, sent_on = Time.now)
     @recipients = "#{payment.web_user.full_name} <#{payment.web_user.email}>"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Nová platba'
     @body       = {'payment' => payment,'app' => app}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def admin_sign_info(payment, app, sent_on = Time.now)
     @recipients = "predplatne@denikreferendum.cz" #predplatne@denikreferendum.cz
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Nová registrace'
     @body       = {'payment' => payment,'app' => app}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def confirm_payment_info(payment, app, sent_on = Time.now)
       @recipients = "#{payment.web_user.full_name} <#{payment.web_user.email}>"
       @from       = "#{app[:title]} <#{app[:email]}>"
       @subject    = 'Potvrzení platby'
       @body       = {'payment' => payment,'app' => app}
       @sent_on    = sent_on
       content_type "text/html"
   end
   
   def mailing(mailing, email, sent_on = Time.now)
     @recipients = "#{email}"
     @from       = "redakce@denikreferendum.cz"
     @subject    = mailing.subject
     @body       = {'mailing' => mailing}
     @sent_on    = mailing.sent_on
     content_type "text/html"
   end
end
