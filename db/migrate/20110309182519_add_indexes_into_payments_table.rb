class AddIndexesIntoPaymentsTable < ActiveRecord::Migration
  def self.up
    add_index :payments, :created_at
  end

  def self.down
    remove_index :payments, :created_at
 end
end
