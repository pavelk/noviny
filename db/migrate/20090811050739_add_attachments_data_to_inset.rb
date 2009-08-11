class AddAttachmentsDataToInset < ActiveRecord::Migration
  def self.up
    add_column :insets, :data_file_name, :string
    add_column :insets, :data_content_type, :string
    add_column :insets, :data_file_size, :integer
  end

  def self.down
    remove_column :insets, :data_file_name
    remove_column :insets, :data_content_type
    remove_column :insets, :data_file_size
  end
end
