class CreateHolidayDefinitions < ActiveRecord::Migration
  def self.up
    create_table :holiday_definitions do |t|
      t.string  :name
      t.date :date_start, :date_end
      t.timestamps
    end
    add_index :holiday_definitions, [:date_start],   :name => 'holiday_definitions_date_start_index'
    add_index :holiday_definitions, [:date_end], :name => 'holiday_definitions_date_end_index'
  end

  def self.down
    drop_table :holiday_definitions
  end
end