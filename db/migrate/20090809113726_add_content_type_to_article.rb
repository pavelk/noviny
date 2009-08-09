class AddContentTypeToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :content_type_id, :integer
    add_index :articles, [:content_type_id],   :name => 'articles_content_type_id_index'
  end

  def self.down
    remove_column :articles, :content_type_id
  end
end
