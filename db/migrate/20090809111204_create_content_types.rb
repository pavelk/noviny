class CreateContentTypes < ActiveRecord::Migration
  def self.up
    create_table :content_types, :force => true do |t|
      t.string :name
    end
  end

  def self.down
    drop_table :content_types
  end
end
