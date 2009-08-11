class AddAttachmentsDataToAudio < ActiveRecord::Migration
  def self.up
    add_column :audios, :data_file_name, :string
    add_column :audios, :data_content_type, :string
    add_column :audios, :data_file_size, :integer
  end

  def self.down
    remove_column :audios, :data_file_name
    remove_column :audios, :data_content_type
    remove_column :audios, :data_file_size
  end
end
