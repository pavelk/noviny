class AddAttachmentsDataToPicture < ActiveRecord::Migration
  def self.up
    add_column :pictures, :data_file_name, :string
    add_column :pictures, :data_content_type, :string
    add_column :pictures, :data_file_size, :integer
  end

  def self.down
    remove_column :pictures, :data_file_name
    remove_column :pictures, :data_content_type
    remove_column :pictures, :data_file_size
  end
end
