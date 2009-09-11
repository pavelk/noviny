class Dailyquestion < ActiveRecord::Base
  
  has_many :question_votes
  
  has_many :dailyquestion_authors
  has_many :authors, :through => :dailyquestion_authors
  
end
