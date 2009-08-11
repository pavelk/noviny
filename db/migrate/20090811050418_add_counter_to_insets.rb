class AddCounterToInsets < ActiveRecord::Migration
  def self.up
    add_column :albums, :insets_count, :integer, :default => 0
  end

  def self.down
    remove_column :albums, :insets_count
  end
end