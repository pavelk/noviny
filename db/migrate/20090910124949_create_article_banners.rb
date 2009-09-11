class CreateArticleBanners < ActiveRecord::Migration
  def self.up
    create_table :article_banners, :force => true do |t|
      t.string :headline #nazev pro boxik, ve vypisu se zobrazuje u obrazku, proto zde neni picture_title
      t.date :publish_date #den, ktereho se boxik tyka
      t.integer :picture_id #obrazek, stejny princip jako u headline
      t.integer :article_id #clanek, se kterym se boxik paruje, stejny princip jako u headline
      t.timestamps
    end
    add_index :article_banners, [:picture_id],   :name => 'article_banners_picture_id_index'
    add_index :article_banners, [:article_id],   :name => 'article_banners_article_id_index'
    add_index :article_banners, [:publish_date],   :name => 'article_banners_publish_date_index'
  end

  def self.down
    drop_table :article_banners
  end
end