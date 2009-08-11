class CreateAudios < ActiveRecord::Migration
  def self.up
    create_table :audios, :force => true do |t|
      t.references :album, :user
      t.string  :name
      t.timestamps
    end
    add_index :audios, [:user_id],   :name => 'audios_user_id_index'
    add_index :audios, [:album_id],   :name => 'audios_album_id_index'
  end

  def self.down
    drop_table :audios
  end
end