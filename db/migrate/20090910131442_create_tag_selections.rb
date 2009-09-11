class CreateTagSelections < ActiveRecord::Migration
  def self.up
    create_table :tag_selections, :force => true do |t|
      t.timestamps
    end
  end

  def self.down
    drop_table :tag_selections
  end
end
