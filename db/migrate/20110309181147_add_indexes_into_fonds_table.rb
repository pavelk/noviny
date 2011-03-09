class AddIndexesIntoFondsTable < ActiveRecord::Migration
  def self.up
    add_index :fonds, :disable
    add_index :fonds, :amount
    add_index :fonds, :email
    add_index :fonds, :variable_number
  end

  def self.down
    remove_index :fonds, :disable
    remove_index :fonds, :amount
    remove_index :fonds, :email
    remove_index :fonds, :variable_number
 end
end
