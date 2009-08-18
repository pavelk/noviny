class CreateArticleSections < ActiveRecord::Migration
  def self.up
    create_table :article_sections do |t|
      t.integer :article_id, :section_id
    end
    add_index :article_sections, [:article_id],:name => 'article_sections_article_id_index'
    add_index :article_sections, [:section_id], :name => 'article_sections_section_id_index'
  end

  def self.down
    drop_table :article_sections
  end
end
