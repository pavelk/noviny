ActiveSupport::CoreExtensions::Time::Conversions::DATE_FORMATS.merge!(
    :article => "%d.%m.%Y %H:%M",
    :news_time => "%H.%M",
    :cz_time => "%H:%M",
    :cz_date => "%d.%m.%Y",
    :tmp_format => "%Y%m%d%H%M%S"
)
ActiveSupport::CoreExtensions::Date::Conversions::DATE_FORMATS.merge!(
    :article => "%d.%m.%Y %H:%M",
    :news_time => "%H.%M",
    :cz_date => "%d.%m.%Y",
    :cz_extend => "%A, %d. %B, %Y"
)