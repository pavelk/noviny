class AddDataToTagSelection < ActiveRecord::Migration
  def self.up
    add_column :tag_selections, :headline, :string
    add_column :tag_selections, :publish_date, :date
  end

  def self.down
    remove_column :tag_selections, :headline
    remove_column :tag_selections, :publish_date
  end
end