class CreateHeadlinerDailyquestions < ActiveRecord::Migration
  def self.up
    create_table :headliner_dailyquestions do |t|
      t.integer :headliner_box_id, :dailyquestion_id
    end
    add_index :headliner_dailyquestions, [:headliner_box_id], :name => 'headliner_dailyquestions_headliner_box_id_index'
    add_index :headliner_dailyquestions, [:dailyquestion_id], :name => 'headliner_dailyquestions_dailyquestion_id_index'
  end

  def self.down
    drop_table :headliner_dailyquestions
  end
end
