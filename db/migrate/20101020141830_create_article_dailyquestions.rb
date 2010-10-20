class CreateArticleDailyquestions < ActiveRecord::Migration
  def self.up
    create_table :article_dailyquestions do |t|
      t.integer :article_id, :dailyquestion_id
    end
    add_index :article_dailyquestions, [:article_id], :name => 'article_dailyquestions_article_id_index'
    add_index :article_dailyquestions, [:dailyquestion_id], :name => 'article_dailyquestions_dailyquestion_id_index'
  end

  def self.down
    drop_table :article_dailyquestions
  end
end
