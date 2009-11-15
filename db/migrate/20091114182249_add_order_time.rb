class AddOrderTime < ActiveRecord::Migration
  def self.up
    add_column :articles, :order_time, :time
    execute("
    UPDATE articles
      SET order_time=articles.order_date;
    ")
    change_column :articles, :order_date, :date
  end

  def self.down
    change_column :articles, :order_date, :datetime
    Article.all.each do |ar|
      ar.ignore_set_order_date = 1
      if ar.order_time
        new_date = ar.order_date.to_time.change(:hour=>ar.order_time.hour,:min=>ar.order_time.min,:sec=>ar.order_time.sec)
        ar.update_attributes(:order_date=>new_date)
      end      
    end
    remove_column :articles, :order_time
  end

end
