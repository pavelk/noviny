class AddTypePictureToPicture < ActiveRecord::Migration
  def self.up
    add_column :pictures, :type_image, :string
  end

  def self.down
    remove_column :pictures, :type_image
  end
end
