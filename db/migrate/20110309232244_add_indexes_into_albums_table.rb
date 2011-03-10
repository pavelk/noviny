class AddIndexesIntoAlbumsTable < ActiveRecord::Migration
  def self.up
    add_index :albums, [ :album_type, :created_at ]
  end

  def self.down
    remove_index :albums, [ :album_type, :created_at ]
  end
end
