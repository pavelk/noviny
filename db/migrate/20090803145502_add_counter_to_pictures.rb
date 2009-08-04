class AddCounterToPictures < ActiveRecord::Migration
  def self.up
    add_column :albums, :pictures_count, :integer, :default => 0 
  end

  def self.down
    remove_column :albums, :pictures_count
  end
end
