class CreateInfoBoxPictures < ActiveRecord::Migration
  def self.up
    create_table :info_box_pictures do |t|
      t.integer :picture_id, :info_box_id
    end
    add_index :info_box_pictures, [:picture_id],   :name => 'info_box_pictures_picture_id_index'
    add_index :info_box_pictures, [:info_box_id], :name => 'info_box_id_pictures_info_box_id_id_index'
  end

  def self.down
    drop_table :info_box_pictures
  end
end