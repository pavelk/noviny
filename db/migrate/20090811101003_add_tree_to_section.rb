class AddTreeToSection < ActiveRecord::Migration
  def self.up
    add_column :sections, :parent_id, :integer
    add_column :sections, :lft, :integer
    add_column :sections, :rgt, :integer
    
    add_index :sections, [:parent_id], :name => 'sections_parent_id_index'
    add_index :sections, [:lft, :rgt], :name => 'sections_lft_rgt_index'
  end

  def self.down
    remove_column :sections, :parent_id
    remove_column :sections, :lft
    remove_column :sections, :rgt
  end
end