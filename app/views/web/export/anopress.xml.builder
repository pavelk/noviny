xml.instruct!
  xml.DOCS do
    @articles.each do |article|
      next if article.name.nil? or  article.text.nil? or article.publish_date.nil?
      xml.ARTC do
        xml.HDRA do
          xml.SRCM "DenikReferendum.cz"
          xml.DATI article.publish_date.to_formatted_s(:cz_date)
          xml.TITA article.name
          xml.LNKW detail_article_url(pretty_id(article))
          xml.LANG "cz"
          xml.CLMN article.section.name unless article.section.nil?
        end
        xml.TXTA do
          xml.cdata! article.text
        end
      end
    end
  end

