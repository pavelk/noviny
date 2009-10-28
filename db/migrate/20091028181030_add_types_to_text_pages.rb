class AddTypesToTextPages < ActiveRecord::Migration
  def self.up
    add_column :text_pages, :visibility, :boolean
  end

  def self.down
    remove_column :text_pages, :visibility
  end
end
