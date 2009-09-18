class CreateArticleThemes < ActiveRecord::Migration
  def self.up
    create_table :article_themes do |t|
      t.integer :article_id, :theme_id
    end
    add_index :article_themes, [:article_id],   :name => 'article_themes_article_id_index'
    add_index :article_themes, [:theme_id], :name => 'article_themes_theme_id_index'
  end

  def self.down
    drop_table :article_themes
  end
end