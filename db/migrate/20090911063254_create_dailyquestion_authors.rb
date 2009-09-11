class CreateDailyquestionAuthors < ActiveRecord::Migration
  def self.up
    create_table :dailyquestion_authors do |t|
      t.integer :dailyquestion_id, :author_id
      t.boolean :question_value
      t.string :question_text
    end
    add_index :dailyquestion_authors, [:dailyquestion_id],:name => 'dailyquestion_authors_dailyquestion_id_index'
    add_index :dailyquestion_authors, [:author_id], :name => 'dailyquestion_authors_author_id_index'
  end

  def self.down
    drop_table :dailyquestion_authors
  end
end