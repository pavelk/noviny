class CreateFonds < ActiveRecord::Migration
  def self.up
    create_table :fonds do |t|
      t.string :firstname
      t.string :lastname
      t.string :street
      t.string :city
      t.string :number
      t.string :psc
      t.string :email
      t.string :profession
      t.string :phone
      t.string :title
      t.boolean :publish_name
      t.boolean :setup_access
      t.boolean :email_news
      t.boolean :address_news
      t.integer :amount
      t.integer :variable_number

      t.timestamps
    end
  end

  def self.down
    drop_table :fonds
  end
end
