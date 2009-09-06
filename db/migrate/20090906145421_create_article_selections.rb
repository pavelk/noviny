class CreateArticleSelections < ActiveRecord::Migration
  def self.up
    create_table :article_selections, :force => true do |t|
      t.integer :section_id, :article_id
      t.string :sidebar_articles_ids
      t.date :publish_date
      t.timestamps
    end
    add_index :article_selections, [:section_id],   :name => 'article_selections_section_id_index'
    add_index :article_selections, [:main_article_id],   :name => 'article_selections_main_article_id_index'
    add_index :article_selections, [:sidebar_articles_ids],   :name => 'article_selections_sidebar_articles_ids_index'
    add_index :article_selections, [:publish_date],   :name => 'article_selections_publish_date_index'
  end

  def self.down
    drop_table :article_selections
  end
end
