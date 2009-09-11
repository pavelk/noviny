class CreateHeadlinerArticles < ActiveRecord::Migration
  def self.up
    create_table :headliner_articles do |t|
      t.integer :headliner_box_id, :article_id
    end
    add_index :headliner_articles, [:headliner_box_id],:name => 'headliner_articles_headliner_box_id_index'
    add_index :headliner_articles, [:article_id], :name => 'headliner_articles_article_id_index'
  end

  def self.down
    drop_table :headliner_articles
  end
end