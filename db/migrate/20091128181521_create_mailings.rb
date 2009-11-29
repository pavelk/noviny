class CreateMailings < ActiveRecord::Migration
  def self.up
    create_table "mailings",  :options => 'default charset=utf8',:force => true do |t|
      t.text   "text"
      t.string  "subject"
      t.timestamps
      t.datetime  "sent_on"  
    end
    
    create_table "newsletters_mailings",  :options => 'default charset=utf8',:force => true do |t|
      t.integer   :newsletter_id, :mailing_id 
    end
    add_index :newsletters_mailings, [:newsletter_id, :mailing_id ]
    add_column :newsletters, :active, :boolean, :default=>true
    
  end

  def self.down
    drop_table :mailings
    drop_table :newsletters_mailings
    remove_column :newsletters, :active
  end
end
