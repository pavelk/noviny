class Notification < ActionMailer::Base
  helper :application
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
   
   def sign1_info(newuser, app, sent_on = Time.now)
     @recipients = "#{newuser.full_name} <#{newuser.email}>"
     @bcc        = "predplatne@denikreferendum.cz"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Registrace uživatele'
     @body       = {'newuser' => newuser,'app' => app}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def sign2_info(payment, app, sent_on = Time.now)
     @recipients = "#{payment.web_user.full_name} <#{payment.web_user.email}>"
     @bcc        = "predplatne@denikreferendum.cz"
     @from       = "#{app[:title]} <#{app[:email]}>"
     @subject    = 'Informace o přijetí požadavku na uhrazení předplatného'
     @body       = {'payment' => payment,'app' => app}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def new_payment(payment, app, sent_on = Time.now)
     @recipients = "#{payment.web_user.full_name} <#{payment.web_user.email}>"
     @bcc        = "predplatne@denikreferendum.cz"
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
       @bcc        = "predplatne@denikreferendum.cz"
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
   
   def delete_newsletter(newsletter, sent_on = Time.now)
     @recipients = "#{newsletter.email}"
     @from       = "redakce@denikreferendum.cz"
     @subject    = "Zrušení odebírání zpravodaje"
     @body       = {'newsletter' => newsletter}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def article(article, email, pretty_url, firstname, lastname, sent_on = Time.now)
     @recipients = "#{email}"
     @from       = "redakce@denikreferendum.cz"
     @subject    = article.name
     @body       = {'article' => article, 'pretty_url' => pretty_url, 'firstname' => firstname, 'lastname' => lastname}
     @sent_on    = sent_on
     content_type "text/html"
   end
   
   def discuss(article, email, sent_on = Time.now)
     @recipients = "#{email}"
     @from       = "redakce@denikreferendum.cz"
     @subject    = "Upozornění z Deníku Referendum"
     @body       = {'article' => article}
     @sent_on    = sent_on
     content_type "text/html"
   end

   def fond_registration(fond, sent_on = Time.now)
     @recipients = "#{fond.email}"
     @from       = "nfndr@denikreferendum.cz"
     @subject    = "Nadační fond Deníku Referendum"
     @body       = {'fond' => fond}
     @sent_on    = sent_on
     content_type "text/html"
   end

end
