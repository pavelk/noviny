class AddWebUsersConfirmation < ActiveRecord::Migration
  def self.up
    add_column :web_users, :send_discuss_notification, :boolean, :default=> false
    add_index :web_users, :send_discuss_notification
    
    add_column :web_users, :send_my_discuss_notification, :boolean, :default=> false
    add_index :web_users, :send_my_discuss_notification
  end

  def self.down
    remove_column :web_users, :send_discuss_notification
    remove_column :web_users, :send_my_discuss_notification
  end
end
