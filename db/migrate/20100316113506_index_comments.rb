class IndexComments < ActiveRecord::Migration
  def self.up
    add_index :article_comments, :created_at
  end

  def self.down
    remove_index :article_comments, :created_at
  end
end
