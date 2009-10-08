class CreateWebUsers < ActiveRecord::Migration
  def self.up
    create_table "web_users",  :options => 'default charset=utf8',:force => true do |t|
      t.string   "login",           :limit => 40, :null => false
      t.string   "cryptpassword",   :limit => 40, :null => false
      t.string   "validkey",        :limit => 40
      t.string   "email",           :limit => 100, :null => false
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "confirmed",       :default => false
      t.text     "domains",         :null => false
      t.string   "firstname"
      t.string   "lastname"
      t.string    "street"
      t.string    "city"
      t.string    "number"
      t.string    "psc"
      t.string    "profession"
      t.string    "phone"
      t.string    "title"
      t.boolean   "send_reports",   :default=>false
      t.boolean   "payed",   :default=>false
      t.integer   "author_id"
      t.date      "expire_date",   :default=>nil
    end
  end

  def self.down
    drop_table :web_users
  end
end
