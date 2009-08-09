class CreateArticlePictures < ActiveRecord::Migration
  def self.up
    create_table :article_pictures do |t|
      t.integer :picture_id, :article_id
    end
    add_index :article_pictures, [:picture_id],   :name => 'article_pictures_picture_id_index'
    add_index :article_pictures, [:article_id], :name => 'article_pictures_article_id_index'
  end

  def self.down
    drop_table :article_pictures
  end
end