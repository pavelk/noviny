class AddVersionToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :version, :integer, :default => 1
  end

  def self.down
    remove_column :articles, :version
  end
end
