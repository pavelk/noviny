class CreatePopupFonds < ActiveRecord::Migration
  def self.up
    create_table :popup_fonds do |t|
      t.datetime :last_view_popup
      t.string :ip_address

      t.timestamps
    end
    add_index :popup_fonds, :ip_address
  end

  def self.down
    drop_table :popup_fonds
  end
end
