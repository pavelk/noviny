class AddSectionsToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :section_id, :integer
    add_column :articles, :subsection_id, :integer
    add_index :articles, [:section_id],   :name => 'articles_section_id_index'
    add_index :articles, [:subsection_id], :name => 'articles_subsection_id_index'
  end

  def self.down
    remove_column :articles, :section_id
    remove_column :articles, :subsection_id
  end
end
