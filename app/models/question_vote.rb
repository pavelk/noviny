class QuestionVote < ActiveRecord::Base
  attr_protected :ipaddr, :user_id
  
  belongs_to :dailyquestion, :foreign_key=>"question_id"
  
end
