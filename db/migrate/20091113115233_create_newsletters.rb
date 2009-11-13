class CreateNewsletters < ActiveRecord::Migration
  def self.up
    create_table "newsletters",  :options => 'default charset=utf8',:force => true do |t|
      t.string   "email",   :limit => 100, :null => false
    end
  end

  def self.down
    drop_table :newsletters
  end
end
