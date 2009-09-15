class CreateRelationthemeships < ActiveRecord::Migration
  def self.up
    create_table :relationthemeships do |t|
      t.integer :theme_id
      t.integer :reltheme_id
      t.timestamps
    end
    add_index :relationthemeships, [:theme_id],   :name => ':relationthemeships_theme_id_index'
    add_index :relationthemeships, [:reltheme_id],   :name => ':relationthemeships_reltheme_id_index'
  end

  def self.down
    drop_table :relationthemeships
  end
end