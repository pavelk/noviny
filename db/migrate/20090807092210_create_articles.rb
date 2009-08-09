class CreateArticles < ActiveRecord::Migration
  def self.up
     create_table :articles, :force => true do |t|
       t.integer :user_id
       t.string :name
       t.datetime :publish_date
       t.text :perex
       t.text :text
       t.text :poznamka
       t.boolean :hp
       t.boolean :approved
       t.timestamps
      end
      add_index :articles, [:user_id],   :name => 'articles_user_id_index'
  end

  def self.down
  end
end
