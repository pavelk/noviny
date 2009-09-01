#Added by Jan Uhlar
class CreateArticleViews < ActiveRecord::Migration
  def self.up
    create_table :article_views do |t|
      t.integer  "article_id"
      t.datetime "shown_date"
    end

    add_index :article_views, [:article_id],:name => 'article_views_article_id_index'
  end

  def self.down
    drop_table :article_views
  end
end
