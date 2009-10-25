class AddIpaddrToVotes < ActiveRecord::Migration
  def self.up
    rename_column :question_votes, :user_id, :web_user_id
    add_column :question_votes, :ipaddr, :string, :limit=>15
    add_index  :question_votes, :ipaddr
  end

  def self.down
    rename_column :question_votes, :web_user_id, :user_id
    remove_column :question_votes, :ipaddr
  end
end
