class AddIndexes < ActiveRecord::Migration
  def self.up
    add_index :articles, :order_date
    add_index :articles, :order_time
    add_index :articles, :approved
    add_index :articles, :visibility
    
    add_index :article_selections, :article_id
    add_index :article_selections, :publish_date
    
    add_index :article_views, :shown_date
    
    add_index :dailyquestions, :publish_date
    add_index :dailyquestions, :approved
    
    add_index :payments, :payed_at
    add_index :payments, :status
    add_index :payments, :variable_symbol
    
    add_index :sections, :name
    add_index :sections, :position
    
    add_index :authors, :firstname
    add_index :authors, :surname
    
    add_index :newsletters, :active
    
    add_index :subsections, :name
    
    add_index :tags, :name
    
    add_index :text_pages, :approved
    add_index :text_pages, :visibility
    add_index :text_pages, :name
    
    add_index :web_users, :login
    add_index :web_users, :confirmed
    add_index :web_users, :send_reports
    add_index :web_users, :author_id
    add_index :web_users, :expire_date
    add_index :web_users, :country_id
  end

  def self.down
    remove_index :articles, :order_date
    remove_index :articles, :order_time
    remove_index :articles, :approved
    remove_index :articles, :visibility
    
    remove_index :article_selections, :article_id
    remove_index :article_selections, :publish_date
    
    remove_index :article_views, :shown_date
    
    remove_index :dailyquestions, :publish_date
    remove_index :dailyquestions, :approved
    
    remove_index :payments, :payed_at
    remove_index :payments, :status
    remove_index :payments, :variable_symbol
    
    remove_index :sections, :name
    remove_index :sections, :position
    
    remove_index :authors, :firstname
    remove_index :authors, :surname
    
    remove_index :newsletters, :active
    
    remove_index :subsections, :name
    
    remove_index :tags, :name
    
    remove_index :text_pages, :approved
    remove_index :text_pages, :visibility
    remove_index :text_pages, :name
    
    remove_index :web_users, :login
    remove_index :web_users, :confirmed
    remove_index :web_users, :send_reports
    remove_index :web_users, :author_id
    remove_index :web_users, :expire_date
    remove_index :web_users, :country_id
  end
end
