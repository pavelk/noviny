class CreateFlashphotoArticles < ActiveRecord::Migration
  def self.up
    create_table :flashphoto_articles do |t|
      t.integer "article_id"
      t.timestamps
    end
    add_index :flashphoto_articles, [:article_id],   :name => 'flashphoto_articles_article_id_index'
  end

  def self.down
    drop_table :flashphoto_articles
  end
end