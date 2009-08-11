class CreateAuthorPictures < ActiveRecord::Migration
  def self.up
    create_table :author_pictures do |t|
      t.integer :picture_id, :author_id
    end
    add_index :author_pictures, [:picture_id],:name => 'author_pictures_picture_id_index'
    add_index :author_pictures, [:author_id], :name => 'author_pictures_author_id_index'
  end

  def self.down
    drop_table :author_pictures
  end
end
