class CreateArticleBoxes < ActiveRecord::Migration
  def self.up
    create_table :article_boxes do |t|
      t.integer :article_id, :info_box_id
    end
    add_index :article_boxes, [:article_id],   :name => 'article_boxes_article_id_index'
    add_index :article_boxes, [:info_box_id], :name => 'article_boxes_info_box_id_index'
  end

  def self.down
    drop_table :article_boxes
  end
end