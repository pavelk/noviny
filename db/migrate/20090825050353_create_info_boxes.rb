class CreateInfoBoxes < ActiveRecord::Migration
  def self.up
    create_table :info_boxes, :force => true do |t|
      t.integer :user_id, :author_id
      t.string  :title, :name
      t.text    :text
      t.timestamps
    end
    add_index :info_boxes, [:user_id],   :name => 'info_boxes_user_id_index'
    add_index :info_boxes, [:user_id],   :name => 'info_boxes_author_id_index'
  end

  def self.down
    drop_table :info_boxes
  end
end