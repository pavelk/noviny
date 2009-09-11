class CreateThemeselectionSections < ActiveRecord::Migration
  def self.up
    create_table :themeselection_sections do |t|
      t.integer :tag_selection_id, :section_id
    end
    add_index :themeselection_sections, [:tag_selection_id],:name => 'themeselection_sections_tag_selection_id_index'
    add_index :themeselection_sections, [:section_id], :name => 'themeselection_sections_section_id_index'
  end

  def self.down
    drop_table :themeselection_sections
  end
end
