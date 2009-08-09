class AddTypeToAlbum < ActiveRecord::Migration
  def self.up
    add_column :albums, :type, :string
    remove_column :albums, :depth
  end

  def self.down
    remove_column :albums, :type
  end
end