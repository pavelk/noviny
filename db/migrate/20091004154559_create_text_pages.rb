class CreateTextPages < ActiveRecord::Migration
  def self.up
    create_table :text_pages, :force => true do |t|
      t.integer :user_id
      t.string :name
      t.string :title
      t.text :perex
      t.text :text
      t.boolean :approved
      t.timestamps
    end
    add_index :text_pages, [:user_id],   :name => 'text_pages_user_id_index'
  end

  def self.down
    drop_table :text_pages
  end
end
