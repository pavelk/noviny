class CreateAuthorInsets < ActiveRecord::Migration
  def self.up
    create_table :author_insets do |t|
      t.integer :inset_id, :author_id
    end
    add_index :author_insets, [:inset_id],:name => 'author_insets_inset_id_index'
    add_index :author_insets, [:author_id], :name => 'author_insets_author_id_index'
  end

  def self.down
    drop_table :author_insets
  end
end