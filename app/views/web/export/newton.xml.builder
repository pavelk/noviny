xml.instruct!
  xml.DenikReferendum do
    @articles.each do |article|
      next if article.name.nil? or article.perex.nil? or article.text.nil?
      xml.Article do
        xml.ArtID article.id
        xml.date article.created_at.to_formatted_s(:cz_date)
        xml.title article.name
        xml.perex article.perex
        xml.body
          xml.cdata! article.text
        xml.author article.author.full_name unless article.author.nil?
        xml.section article.section.name unless article.section.nil?
        xml.url detail_article_url(pretty_id(article))
      end
    end
  end

