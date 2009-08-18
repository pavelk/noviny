class AddDescAndUserToSection < ActiveRecord::Migration
  def self.up
    add_column :sections, :user_id, :integer
    add_column :sections, :author_id, :integer
    add_column :sections, :description, :text
    add_index :sections, [:user_id],   :name => 'sections_user_id_index'
    add_index :sections, [:author_id], :name => 'sections_author_id_index'
  end

  def self.down
    remove_column :sections, :user_id
    remove_column :sections, :author_id
  end
end