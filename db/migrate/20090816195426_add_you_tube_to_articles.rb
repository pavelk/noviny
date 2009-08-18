class AddYouTubeToArticles < ActiveRecord::Migration
  def self.up
     add_column :articles, :videodata, :string
  end

  def self.down
    remove_column :articles, :videodata
  end
end
