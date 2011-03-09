class AddIndexUpdatedAtToPictures < ActiveRecord::Migration
  def self.up
    add_index :pictures, :updated_at
  end

  def self.down
    remove_index :pictures, :updated_at
  end
end
