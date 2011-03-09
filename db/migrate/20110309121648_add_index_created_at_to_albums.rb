class AddIndexCreatedAtToAlbums < ActiveRecord::Migration
  def self.up
    add_index :albums, :created_at
  end

  def self.down
    remove_index :albums, :created_at
  end
end
