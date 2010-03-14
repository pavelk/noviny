class UpdateTables2 < ActiveRecord::Migration
  def self.up
    add_column :newsletters, :crypted, :string
    add_column :article_comments, :name, :string
  end

  def self.down
    remove_column :newsletters, :crypted
    remove_column :article_comments, :name
  end
end
