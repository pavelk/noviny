class AddPriorityToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :priority_home, :integer, :null => false, :default => 1
    add_column :articles, :priority_section, :integer, :null => false, :default => 1
    add_column :articles, :visibility, :boolean, :null => false, :default => 0
    remove_column :articles, :hp
    add_index :articles, [:priority_home],   :name => 'articles_priority_home_index'
    add_index :articles, [:priority_section],:name => 'articles_priority_section_index'
  end

  def self.down
    remove_column :articles, :priority_home
    remove_column :articles, :priority_section
    remove_column :articles, :visibility
    add_column :articles, :hp, :boolean
  end
end
