class CreateThemeselectionThemes < ActiveRecord::Migration
  def self.up
    create_table :themeselection_themes do |t|
      t.integer :tag_selection_id, :theme_id
    end
    add_index :themeselection_themes, [:tag_selection_id],:name => 'themeselection_themes_tag_selection_id_index'
    add_index :themeselection_themes, [:theme_id], :name => 'themeselection_themes_theme_id_index'
  end

  def self.down
    drop_table :themeselection_themes
  end
end
