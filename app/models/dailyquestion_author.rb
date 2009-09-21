class DailyquestionAuthor < ActiveRecord::Base
  
  belongs_to :dailyquestion
  belongs_to :author
  
end
