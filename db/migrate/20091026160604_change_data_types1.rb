class ChangeDataTypes1 < ActiveRecord::Migration
  def self.up
    change_column :dailyquestions, :question_text, :text
    change_column :dailyquestions, :text_yes, :text
    change_column :dailyquestions, :text_no, :text
    change_column :articles, :videodata, :text    
  end

  def self.down
    change_column :dailyquestions, :question_text, :string
    change_column :dailyquestions, :text_yes, :string
    change_column :dailyquestions, :text_no, :string
    change_column :articles, :videodata, :string
  end
end