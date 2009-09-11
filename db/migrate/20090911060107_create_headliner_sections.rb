class CreateHeadlinerSections < ActiveRecord::Migration
  def self.up
    create_table :headliner_sections do |t|
      t.integer :headliner_box_id, :section_id
    end
    add_index :headliner_sections, [:headliner_box_id],:name => 'headliner_sections_headliner_box_id_index'
    add_index :headliner_sections, [:section_id], :name => 'headliner_sections_section_id_index'
  end

  def self.down
    drop_table :headliner_sections
  end
end