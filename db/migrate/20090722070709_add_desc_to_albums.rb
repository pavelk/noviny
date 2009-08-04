class AddDescToAlbums < ActiveRecord::Migration
  def self.up
    add_column :albums, :description, :string
  end

  def self.down
    remove_column :albums, :description
  end
end
