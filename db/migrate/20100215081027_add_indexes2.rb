class AddIndexes2 < ActiveRecord::Migration
  def self.up
    add_index :articles, :publish_date
    
    add_index :newsletters, :email
  end

  def self.down
    remove_index :articles, :publish_date
    
    remove_index :newsletters, :email
  end
end
