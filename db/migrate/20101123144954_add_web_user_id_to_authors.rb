class AddWebUserIdToAuthors < ActiveRecord::Migration
  def self.up
    add_column :authors, :web_user_id, :integer
  end

  def self.down
    remove_column :authors, :web_user_id
  end
end
