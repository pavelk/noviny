class AddIndexWebUserIdToAuthors < ActiveRecord::Migration
  def self.up
    add_index :authors, :web_user_id
  end

  def self.down
    remove_index :authors, :web_user_id
  end
end
