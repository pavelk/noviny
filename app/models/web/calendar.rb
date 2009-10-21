class Web::Calendar
  DAYS = %w{Pondělí Úterý Středa Čtvrtek Pátek Sobota Neděle}
  MONTHS = %w{Leden Únor Březen Duben Květen Červen Červenec Srpen Září Říjen Listopad Prosinec}
  MONTHS_ = %w{Ledna Února Března Dubna Května Června Července Srpna Září Října Listopadu Prosince}
  
  def self.current_day
    t = Time.now
    return DAYS[t.wday - 1] + " " + t.to_s(:cz_date)
  end
  
  def self.current_sunday(t = Time.now)
    if self.week?
      return DAYS[t.end_of_week.wday - 1] + " " + t.end_of_week.to_s(:cz_date)
    else
      beg_week = t.beginning_of_week
      return DAYS[beg_week.wday - 1] + " " + beg_week.to_s(:cz_date)
    end
  end
  
  def self.current_saturday(t = Time.now)
    if self.week?
      return DAYS[t.end_of_week.wday - 2] + " " + (t.end_of_week-1.days).to_s(:cz_date)
    else
      beg_week = t.beginning_of_week
      return DAYS[beg_week.wday - 2] + " " + (beg_week-1.days).to_s(:cz_date)
    end
  end
  
  def self.sunday_date(t = Time.now)
    if self.sunday?
      t.beginning_of_day
    else
      (t.beginning_of_week-1.days).beginning_of_day
    end
  end
  
  def self.saturday_date(t = Time.now)
    if self.week?
      (t.end_of_week - 1.days).beginning_of_day
    else
      (t.beginning_of_week-2.days).beginning_of_day
    end
  end
  
  def self.friday_date(t = Time.now)
    if self.week?
      (t.end_of_week-2.days).beginning_of_day
    else
      t.beginning_of_day
    end
  end
  
  def self.week?(t = Time.now)
    t.wday == 6 || t.wday == 0
  end
  
  def self.saturday?(t = Time.now)
    t.wday == 6
  end
  
  def self.sunday?(t = Time.now)
    t.wday == 0
  end
  
  def self.set_opinion_limit(t = Time.now)
    return 4 if t.wday == 1 || t.wday == 2
    return 20
  end
  
end
