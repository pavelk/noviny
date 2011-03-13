class AddColumnIpAddressToFondsTable < ActiveRecord::Migration
  def self.up
    add_column :fonds, :ip_address, :string
    add_index :fonds, :ip_address
  end

  def self.down
    remove_column :fonds, :ip_address
    remove_index :fonds, :ip_address
  end
end
