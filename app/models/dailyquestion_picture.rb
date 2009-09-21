class DailyquestionPicture < ActiveRecord::Base
  
  belongs_to :dailyquestion
  belongs_to :picture
  
end
