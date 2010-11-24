class Dailyquestion < ActiveRecord::Base

  define_index do
    indexes headline, :sortable => true
    indexes question_text
    indexes perex
    indexes text_yes
    indexes text_no
    indexes approved
  end

  has_many :headliner_dailyquestions
  has_many :headliner_boxes, :through => :headliner_dailyquestions
 
  has_many :article_dailyquestions
  has_many :articles, :through => :article_dailyquestions

  has_many :question_votes, :foreign_key=>"question_id"
  
  has_many :dailyquestion_pictures
  has_many :pictures, :through => :dailyquestion_pictures
  
  belongs_to :author_yes, :class_name => "Author", :foreign_key => 'author_yes_id'
  belongs_to :author_no, :class_name => "Author", :foreign_key => 'author_no_id'
 
  has_many :article_banners

  #has_many :dailyquestion_authors
  #has_many :authors, :through => :dailyquestion_authors
  
  #accepts_nested_attributes_for :dailyquestion_authors
   
  def self.first_by_date(date = Time.now)
    if date.to_date < Time.now.to_date
      date = date.end_of_day
    end
    find(:first,
         :conditions=>["publish_date >= ? AND publish_date <= ? AND approved = ?" ,date.beginning_of_day,date,true],
         :select=>"id, headline, perex")
  end
    
  def self.last_active
    find(:last,
         :conditions=>["publish_date <= ? AND approved = ?" ,Time.now.to_date,true])
  end
  
  def self.opened(not_id = nil)
    str = ""
    str += " AND id != #{not_id}" if not_id
    find(:all,
         :conditions=>["publish_date >= ? AND publish_date <= ? AND approved = ?#{str}" ,Time.now-7.days,Time.now.to_date,true],
         :order=>"publish_date DESC")
  end
  
  def self.closed(not_id = nil, page = 1)
    str = ""
    str += " AND id != #{not_id}" if not_id
    paginate(:all,
         :conditions=>["publish_date <= ? AND approved = ?#{str}" ,Time.now-7.days,true],
         :order=>"publish_date DESC",
         #:limit=>10,
         :page => page,
         :per_page => 10 )
  end
    
  def yes_votes_in_perc
    if self.whole_votes > 0
      return round_two((self.yes_votes.to_f/self.whole_votes.to_f) * 100)
    else
      return 0
    end
  end
  
  def no_votes_in_perc
    return (100 - self.yes_votes_in_perc) if self.whole_votes > 0
    return 0
  end
  
  def whole_votes
    QuestionVote.count(:conditions=>{:question_id=>self.id})
  end  
    
  def yes_votes
     return QuestionVote.count(:conditions=>{:question_id=>self.id,:vote_value=>true})
  end
  
  def no_votes
    return QuestionVote.count(:conditions=>{:question_id=>self.id,:vote_value=>false})
  end
    
  def can_vote?
    return (self.publish_date >= (Time.now-7.days)) && (self.publish_date.to_date <= Time.now.to_date) 
  end
  
  def yes_title_results
    "#{yes_votes} hlasů/#{yes_votes_in_perc}%"
  end
  
  def no_title_results
    "#{no_votes} hlasů/#{no_votes_in_perc}%"
  end
  
  protected
  def round_two(number)
   ("%.2f" % number).to_f
  end
end
