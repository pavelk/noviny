class CreatePictures < ActiveRecord::Migration
  def self.up
    create_table :pictures, :force => true do |t|
      t.references :album, :user
      t.string  :name
      t.timestamps
    end
    add_index :pictures, [:user_id],   :name => 'pictures_user_id_index'
    add_index :pictures, [:album_id],   :name => 'pictures_album_id_index'
  end

  def self.down
    drop_table :pictures
  end
end