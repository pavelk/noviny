class Web::Calendar
  DAYS = %w{Pondělí Úterý Středa Čtvrtek Pátek Sobota Neděle}
  MONTHS = %w{Leden Únor Březen Duben Květen Červen Červenec Srpen Září Říjen Listopad Prosinec}
  MONTHS_ = %w{Ledna Února Března Dubna Května Června Července Srpna Září Října Listopadu Prosince}
  
  def self.current_day
    t = Time.now
    return DAYS[t.wday - 1] + " " + t.to_s(:cz_date)
  end
  
end
