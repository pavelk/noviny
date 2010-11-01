class AddCountToArticleView < ActiveRecord::Migration
  def self.up
    add_column :article_views, :count, :integer
  end

  def self.down
    remove_column :article_views, :count
  end
end
