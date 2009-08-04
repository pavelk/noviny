class AddDimensionsToPictures < ActiveRecord::Migration
  def self.up
    add_column :pictures, :data_width, :string
    add_column :pictures, :data_height, :string
  end

  def self.down
    remove_column :pictures, :data_width
    remove_column :pictures, :data_height
  end
end
