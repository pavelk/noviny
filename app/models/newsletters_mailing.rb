class NewslettersMailing < ActiveRecord::Base
  belongs_to :newsletter
  belongs_to :mailing
end
