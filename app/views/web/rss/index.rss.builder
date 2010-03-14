xml.instruct! :xml, :version => "1.0"
xml.rss :version => "2.0" do
  xml.channel do
    xml.title "Deník Referendum"
    xml.description @rss_desc
    xml.link @rss_link
    xml.language "cs"

    for article in @articles
      pub_date = DateTime.strptime(article.order_date.to_s(:cz_date) + " " + article.order_time.to_s(:cz_time),"%d.%m.%Y %H:%M")
      xml.item do
        xml.title article.name
        xml.description article.perex
        xml.pubDate pub_date.to_s(:rfc822)
        xml.author article.author.full_name 
        xml.link detail_article_url(pretty_id(article))
      end
    end
  end
end
