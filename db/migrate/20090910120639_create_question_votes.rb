class CreateQuestionVotes < ActiveRecord::Migration
  def self.up
    create_table :question_votes, :force => true do |t|
      t.integer :question_id #paruje se s dailyquestions, belongs_to
      t.integer :user_id #muze nas zajimat, kdo hlasoval, pokud je zalogovany
      t.boolean :vote_value #ano nebo ne
      t.datetime :created_at #jasny, updated_at zde neni treba
    end
    add_index :question_votes, [:question_id],   :name => 'question_votes_question_id_index'
    add_index :question_votes, [:user_id], :name => 'question_votes_user_id_index'
    add_index :question_votes, [:vote_value], :name => 'question_votes_vote_value_index'
    add_index :question_votes, [:created_at], :name => 'question_votes_created_at_index'
  end

  def self.down
    drop_table :question_votes
  end
end
