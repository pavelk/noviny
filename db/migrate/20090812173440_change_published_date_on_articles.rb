class ChangePublishedDateOnArticles < ActiveRecord::Migration
  def self.up
    change_column :articles, :publish_date, :datetime, :null => false
  end

  def self.down
    change_column :articles, :publish_date, :datetime, :null => false
  end
end