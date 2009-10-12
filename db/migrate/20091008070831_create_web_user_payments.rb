class CreateWebUserPayments < ActiveRecord::Migration
  def self.up
    create_table "web_user_payments",  :options => 'default charset=utf8',:force => true do |t|
      t.datetime "created_at"
      t.date     "payed_at"
      t.integer   "web_user_id"
      t.decimal   "price",   :precision => 10, :scale => 2
    end
  end

  def self.down
    drop_table :web_user_payments
  end
end
