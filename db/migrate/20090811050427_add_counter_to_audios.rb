class AddCounterToAudios < ActiveRecord::Migration
  def self.up
    add_column :albums, :audios_count, :integer, :default => 0
  end

  def self.down
    remove_column :albums, :audios_count
  end
end