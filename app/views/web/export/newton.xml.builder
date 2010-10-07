xml.instruct!
  xml.DenikReferendum do
    @articles.each do |article|
      xml.Article do
        xml.ArtID article.id
        xml.date article.publish_date.to_formatted_s(:cz_date)
        xml.title article.name
        xml.perex article.perex
        xml.body
          xml.cdata! article.text
        xml.author article.author.full_name
        xml.section article.section.name
        xml.url detail_article_url(pretty_id(article))
      end
    end
  end

