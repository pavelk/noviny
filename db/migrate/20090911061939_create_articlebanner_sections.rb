class CreateArticlebannerSections < ActiveRecord::Migration
  def self.up
    create_table :articlebanner_sections do |t|
      t.integer :article_banner_id, :section_id
    end
    add_index :articlebanner_sections, [:article_banner_id],:name => 'articlebanner_sections_article_banner_id_index'
    add_index :articlebanner_sections, [:section_id], :name => 'articlebanner_sections_section_id_index'
  end

  def self.down
    drop_table :articlebanner_sections
  end
end