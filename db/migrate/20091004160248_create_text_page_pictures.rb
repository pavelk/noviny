class CreateTextPagePictures < ActiveRecord::Migration
  def self.up
    create_table :text_page_pictures do |t|
      t.integer :picture_id, :text_page_id
    end
    add_index :text_page_pictures, [:picture_id],   :name => 'text_page_pictures_picture_id_index'
    add_index :text_page_pictures, [:text_page_id], :name => 'text_page_pictures_text_page_id_index'
  end

  def self.down
    drop_table :text_page_pictures
  end
end