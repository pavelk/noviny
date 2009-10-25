class Dailyquestion < ActiveRecord::Base
  
  has_many :question_votes, :foreign_key=>"question_id"
  
  has_many :dailyquestion_pictures
  has_many :pictures, :through => :dailyquestion_pictures
  
  belongs_to :author_yes, :class_name => "Author", :foreign_key => 'author_yes_id'
  belongs_to :author_no, :class_name => "Author", :foreign_key => 'author_no_id'
  
  #has_many :dailyquestion_authors
  #has_many :authors, :through => :dailyquestion_authors
  
  #accepts_nested_attributes_for :dailyquestion_authors
   
  def self.first_by_date(date = Time.now.to_date)
    find(:first,
         :conditions=>["publish_date = ?",date])
  end
    
  def can_vote?
    return (self.publish_date >= (Time.now-7.days).to_date) && (self.publish_date <= Time.now.to_date) 
  end
    
end
