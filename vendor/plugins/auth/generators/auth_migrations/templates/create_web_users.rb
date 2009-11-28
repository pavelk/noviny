class <%= class_name %> < ActiveRecord::Migration
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
      t.string   "firstname",        :limit => 20
      t.string   "lastname",        :limit => 20
      t.string    "street",        :limit => 50
      t.string    "city",        :limit => 50
      t.string    "number",        :limit => 20
      t.string    "psc",        :limit => 10
      t.string    "profession",        :limit => 100
      t.string    "phone",        :limit => 15
      t.string    "title",        :limit => 15
      t.boolean   "send_reports",   :default=>false
      t.boolean   "payed",   :default=>false
      t.integer   "author_id"
      t.datetime   "expire_date",   :default=>nil
    end
  end

  def self.down
    drop_table :web_users
  end
end
