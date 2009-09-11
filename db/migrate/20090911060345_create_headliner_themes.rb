class CreateHeadlinerThemes < ActiveRecord::Migration
  def self.up
    create_table :headliner_themes do |t|
      t.integer :headliner_box_id, :theme_id
    end
    add_index :headliner_themes, [:headliner_box_id],:name => 'headliner_themes_headliner_box_id_index'
    add_index :headliner_themes, [:theme_id], :name => 'headliner_themes_theme_id_index'
  end

  def self.down
    drop_table :headliner_themes
  end
end