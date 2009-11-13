class UpdatePayments2 < ActiveRecord::Migration
  def self.up
    add_column :payments, :pay_method, :string
    add_column :payments, :gift, :decimal,   :precision => 10, :scale => 2
    add_column :web_users, :read_codex, :boolean, :default=>false
  end

  def self.down
    remove_column :payments, :pay_method
    remove_column :payments, :gift
    remove_column :web_users, :read_codex
  end
end
