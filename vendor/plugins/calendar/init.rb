Dir["#{File.dirname(__FILE__)}/lib/*.rb"].each do |lib|
  require lib
end
ActionView::Base.send :include, CalendarHelper
