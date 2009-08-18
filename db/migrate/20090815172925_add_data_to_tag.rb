class AddDataToTag < ActiveRecord::Migration
  def self.up
    add_column :tags, :user_id, :integer
    add_column :tags, :description, :string
    add_column :tags, :created_at, :datetime
    add_column :tags, :updated_at, :datetime
    
    add_index :tags, [:user_id],   :name => 'tags_user_id_index'
  end

  def self.down
    remove_column :tags, :user_id
    remove_column :tags, :description
    remove_column :tags, :created_at
    remove_column :tags, :updated_at
  end
end
