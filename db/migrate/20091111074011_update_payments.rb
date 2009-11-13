class UpdatePayments < ActiveRecord::Migration
  def self.up
    drop_table :web_user_payments
    create_table "payments",  :options => 'default charset=utf8',:force => true do |t|
      t.timestamps
      t.datetime  "payed_at", :default=>nil
      t.integer   "web_user_id"
      t.integer   "status", :default=>0
      t.decimal   "price",   :precision => 10, :scale => 2
      t.string    "variable_symbol", :limit=>10
    end
    remove_column :web_users, :payed
    add_index :payments, [:web_user_id,:payed_at]
  end

  def self.down
    drop_table :payments
  end
end
