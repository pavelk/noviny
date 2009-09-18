class AddDataToDailyquestion < ActiveRecord::Migration
  def self.up
    add_column :dailyquestions, :author_yes_id, :integer
    add_column :dailyquestions, :author_no_id, :integer
    add_column :dailyquestions, :text_yes, :string
    add_column :dailyquestions, :text_no, :string
    
    add_index :dailyquestions, [:author_yes_id],   :name => 'dailyquestions_author_yes_id_index'
    add_index :dailyquestions, [:author_no_id], :name => 'dailyquestions_author_no_id_index'
    
  end

  def self.down
    remove_column :dailyquestions, :author_yes_id
    remove_column :dailyquestions, :author_no_id
    remove_column :dailyquestions, :text_yes
    remove_column :dailyquestions, :text_no
  end
end