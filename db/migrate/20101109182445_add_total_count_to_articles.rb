class AddTotalCountToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :total_count, :integer, :default => 0
  end

  def self.down
    remove_column :articles, :total_count
  end
end
