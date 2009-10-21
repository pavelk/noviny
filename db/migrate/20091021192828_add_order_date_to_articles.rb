class AddOrderDateToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :order_date, :datetime
  end

  def self.down
    remove_column :articles, :order_date
  end
end
