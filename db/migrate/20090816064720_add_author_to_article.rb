class AddAuthorToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :author_id, :integer
    add_index :articles, [:author_id],   :name => 'articles_author_id_on_index'
  end

  def self.down
    remove_column :articles, :author_id
  end
end
