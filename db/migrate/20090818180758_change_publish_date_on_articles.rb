class ChangePublishDateOnArticles < ActiveRecord::Migration
  def self.up
    change_column :articles, :publish_date, :datetime, :null => true, :default => nil
  end

  def self.down
    change_column :articles, :publish_date, :datetime, :null => false
  end
end