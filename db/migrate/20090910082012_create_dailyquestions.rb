class CreateDailyquestions < ActiveRecord::Migration
  #tabulka pro "Otazka dne", komentare tusim zbytecne
  def self.up
    create_table :dailyquestions, :force => true do |t|
      t.string :headline
      t.string :question_text
      t.text :perex
      t.date :publish_date
      t.timestamps
    end
  end

  def self.down
    drop_table :dailyquestions
  end
end
