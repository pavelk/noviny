class CreateReallyFonds < ActiveRecord::Migration
  def self.up
    create_table :really_fonds do |t|
      t.integer :fond_id
      t.datetime :date
      t.string :account_number

      t.timestamps
    end
  end

  def self.down
    drop_table :really_fonds
  end
end
