class CreateAlbums < ActiveRecord::Migration
  def self.up
    create_table :albums, :force => true do |t|
      t.integer :user_id, :parent_id, :lft, :rgt, :depth
      t.string  :name
      t.timestamps
    end
    add_index :albums, [:user_id],   :name => 'albums_user_id_index'
    add_index :albums, [:parent_id], :name => 'albums_parent_id_index'
    add_index :albums, [:lft, :rgt], :name => 'albums_lft_rgt_index'
    add_index :albums, [:depth],     :name => 'albums_depth_index'
  end

  def self.down
    drop_table :albums
  end
end