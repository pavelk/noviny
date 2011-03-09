class AddIndexesIntoWebUsersTable < ActiveRecord::Migration
  def self.up
    add_index :web_users, :email
    add_index :web_users, :firstname
    add_index :web_users, :lastname
 end

  def self.down
    remove_index :web_users, :email
    remove_index :web_users, :firstname
    remove_index :web_users, :lastname
  end
end
