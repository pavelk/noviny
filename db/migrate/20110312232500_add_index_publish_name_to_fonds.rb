class AddIndexPublishNameToFonds < ActiveRecord::Migration
  def self.up
    add_index :fonds, :publish_name
  end

  def self.down
    remove_index :fonds, :publish_name
  end
end
