class AddTypesToArticleBanners < ActiveRecord::Migration
  def self.up
    add_column :article_banners, :priority_home, :integer, :null => false, :default => 1
    add_column :article_banners, :priority_section, :integer, :null => false, :default => 1
    add_index :article_banners, [:priority_home],   :name => 'article_banners_priority_home_index'
    add_index :article_banners, [:priority_section],:name => 'article_banners_priority_section_index'
  end

  def self.down
    remove_column :article_banners, :priority_home
    remove_column :article_banners, :priority_section
  end
end
