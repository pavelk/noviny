class AddArticleUpdates < ActiveRecord::Migration
  def self.up
     create_table :articles_updates_history, :force => true do |t|
       t.integer :user_id, :article_id, :status
       t.datetime :change_date
      end
      add_index :articles_updates_history, [:article_id],   :name => 'articles_updates_history_article_id_index'
  end

  def self.down
  end
end