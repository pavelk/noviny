class AddContactsToAuthors < ActiveRecord::Migration
  def self.up
    add_column :authors, :linkedin, :string
    add_column :authors, :twitter, :string
    add_column :authors, :facebook, :string
    add_column :authors, :phone, :string
  end

  def self.down
    remove_column :authors, :linkedin
    remove_column :authors, :twitter
    remove_column :authors, :facebook
    remove_column :authors, :phone
  end
end
