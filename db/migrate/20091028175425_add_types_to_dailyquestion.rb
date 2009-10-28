class AddTypesToDailyquestion < ActiveRecord::Migration
  def self.up
    change_column :dailyquestions, :publish_date, :datetime
    add_column :dailyquestions, :approved, :boolean
  end

  def self.down
    change_column :dailyquestions, :publish_date, :date
    remove_column :dailyquestions, :approved
  end
end
