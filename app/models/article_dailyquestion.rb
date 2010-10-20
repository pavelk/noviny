class ArticleDailyquestion < ActiveRecord::Base
  belongs_to :article
  belongs_to :dailyquestion
end
