class AddSecAuthorToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :author_sec_id, :integer
    add_index :articles, [:author_sec_id], :name => 'articles_author_sec_id_index'
  end

  def self.down
    remove_column :articles, :author_sec_id
  end
end
