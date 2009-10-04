class AddAuthorToPictures < ActiveRecord::Migration
  def self.up
    add_column :pictures, :author, :string
  end

  def self.down
    remove_column :pictures, :author
  end
end
