class Web::Calendar
  DAYS = %w{Pondělí Úterý Středa Čtvrtek Pátek Sobota Neděle}
  MONTHS = %w{Leden Únor Březen Duben Květen Červen Červenec Srpen Září Říjen Listopad Prosinec}
  MONTHS_ = %w{Ledna Února Března Dubna Května Června Července Srpna Září Října Listopadu Prosince}
  
  def self.current_day
    t = Time.now
    return DAYS[t.wday - 1] + " " + t.to_s(:cz_date)
  end
  
  def self.current_sunday(t = Time.now)
    end_week = t.end_of_week
    return DAYS[end_week.wday - 1] + " " + end_week.to_s(:cz_date)
  end
  
  def self.current_saturday(t = Time.now)
    end_week = t.end_of_week
    return DAYS[end_week.wday - 2] + " " + (end_week-1.days).to_s(:cz_date)
  end
  
  def self.sunday_date(t = Time.now)
    t.end_of_week
  end
  
  def self.saturday_date(t = Time.now)
    (t.end_of_week)-1.days
  end
  
  def self.week?(t = Time.now)
    t.wday == 6 || Time.now.wday == 0
  end
  
end
