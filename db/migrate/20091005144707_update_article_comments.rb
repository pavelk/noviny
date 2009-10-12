class UpdateArticleComments < ActiveRecord::Migration
  def self.up
    remove_column :article_comments, :user_id
    add_column    :article_comments, :web_user_id, :integer
    add_index :article_comments, :web_user_id
    add_index :article_comments, :article_id
  end

  def self.down
    remove_column :article_comments, :web_user_id
    add_column    :article_comments, :user_id, :integer
  end
end
