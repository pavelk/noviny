class AddTypesToAlbum < ActiveRecord::Migration
  def self.up
    add_column :albums, :album_type, :string
  end

  def self.down
    remove_column :albums, :album_type
  end
end
