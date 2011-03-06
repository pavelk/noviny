class AddIndexFondIdToReallyFonds < ActiveRecord::Migration
  def self.up
    add_index :really_fonds, :fond_id
  end

  def self.down
    remove_index :really_fonds, :fond_id
  end
end
