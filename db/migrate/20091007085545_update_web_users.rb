class UpdateWebUsers < ActiveRecord::Migration
  def self.up
    add_column :web_users, :born_date, :date
    add_column :web_users, :web, :string
    add_column :web_users, :skype, :string
    add_column :web_users, :twitter, :string
    
    add_column :web_users, :show_mail, :boolean, :default=>false
    add_column :web_users, :show_phone, :boolean, :default=>false
    add_column :web_users, :show_address, :boolean, :default=>false
    add_column :web_users, :show_web, :boolean, :default=>false
    add_column :web_users, :show_skype, :boolean, :default=>false
    add_column :web_users, :show_twitter, :boolean, :default=>false
    
    add_column :web_users, :photo_file_name, :string # Original filename
    add_column :web_users, :photo_content_type, :string # Mime type
    add_column :web_users, :photo_file_size, :integer # File size in bytes
  end

  def self.down
    remove_column :web_users, :born_date
    remove_column :web_users, :web
    remove_column :web_users, :skype
    remove_column :web_users, :twitter
    
    remove_column :web_users, :show_mail
    remove_column :web_users, :show_phone
    remove_column :web_users, :show_address
    remove_column :web_users, :show_web
    remove_column :web_users, :show_skype
    remove_column :web_users, :show_twitter
    
    remove_column :web_users, :photo_file_name
    remove_column :web_users, :photo_content_type
    remove_column :web_users, :photo_file_size
  end
end
