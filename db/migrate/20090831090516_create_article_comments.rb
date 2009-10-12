#Added by Jan Uhlar
class CreateArticleComments < ActiveRecord::Migration
  def self.up
    create_table :article_comments do |t|
      t.integer  "article_id"
      t.integer  "user_id"
      t.datetime "created_at"
      t.text     "text"
    end

    add_index :article_comments, [:article_id],:name => 'article_comments_article_id_index'
    add_index :article_comments, [:user_id],:name => 'article_comments_user_id_index'
  end

  def self.down
    drop_table :article_comments
  end
end
