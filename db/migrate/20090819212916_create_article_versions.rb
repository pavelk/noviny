class CreateArticleVersions < ActiveRecord::Migration
  def self.up
    create_table :article_versions do |t|
      t.integer :article_id, :version, :author_id
      t.string  :name
      t.text    :perex, :text, :poznamka
      t.timestamps
    end
    add_index :article_versions, [:article_id],:name => 'article_versions_article_id_index'
    add_index :article_versions, [:version], :name => 'article_versions_version_index'
    add_index :article_versions, [:author_id], :name => 'article_versions_author_id_index'
  end

  def self.down
    drop_table :article_versions
  end
end
