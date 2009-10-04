class CreateTextPageInsets < ActiveRecord::Migration
  def self.up
    create_table :text_page_insets do |t|
      t.integer :inset_id, :text_page_id
    end
    add_index :text_page_insets, [:inset_id],   :name => 'text_page_insets_inset_id_index'
    add_index :text_page_insets, [:text_page_id], :name => 'text_page_insets_text_page_id_index'
  end

  def self.down
    drop_table :text_page_insets
  end
end