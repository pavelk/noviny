class CreateArticleInsets < ActiveRecord::Migration
  def self.up
    create_table :article_insets do |t|
      t.integer :inset_id, :article_id
    end
    add_index :article_insets, [:inset_id],   :name => 'article_insets_inset_id_index'
    add_index :article_insets, [:article_id], :name => 'article_insets_article_id_index'
  end

  def self.down
    drop_table :article_insets
  end
end