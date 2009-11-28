class AddUserColumn < ActiveRecord::Migration
  def self.up
    add_column :web_users, :show_city, :boolean, :default=>false
    add_column :web_users, :show_berth, :boolean, :default=>false
  end

  def self.down
    remove_column :web_users, :show_city
    remove_column :web_users, :show_berth
  end
end
