class UpdateCountries < ActiveRecord::Migration
  def self.up
    add_column :web_users, :country_id, :integer, :default=>Country.cze_id
  end

  def self.down
    remove_column :web_users, :country_id
  end
end
