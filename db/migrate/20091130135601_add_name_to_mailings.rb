class AddNameToMailings < ActiveRecord::Migration
  def self.up
    add_column :mailings, :name, :string, :default=>"Zpravodaj Sedm dní Deníku Referendum"
    
    create_table "temp_newsletters",  :options => 'default charset=utf8',:force => true do |t|
      t.string   "email",   :limit => 100, :null => false
    end
  end

  def self.down
    remove_column :mailings, :name
    drop_table :temp_newsletters
  end
end
