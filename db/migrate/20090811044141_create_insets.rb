class CreateInsets < ActiveRecord::Migration
  def self.up
    create_table :insets, :force => true do |t|
      t.references :album, :user
      t.string  :name
      t.timestamps
    end
    add_index :insets, [:user_id],   :name => 'insets_user_id_index'
    add_index :insets, [:album_id],   :name => 'insets_album_id_index'
  end

  def self.down
    drop_table :insets
  end
end