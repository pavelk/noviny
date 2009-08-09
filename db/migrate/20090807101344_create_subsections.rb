class CreateSubsections < ActiveRecord::Migration
  def self.up
    create_table :subsections, :force => true do |t|
      t.string :name
      t.timestamps
    end
  end

  def self.down
    drop_table :subsections
  end
end
