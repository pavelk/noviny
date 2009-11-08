class AddPictureToArticles < ActiveRecord::Migration
  def self.up
    add_column :articles, :picture_id, :integer
    add_column :articles, :first_image_title, :string
    add_column :articles, :first_approved_date, :datetime
    add_column :articles, :major_modified_date, :datetime
    add_index :articles, [:picture_id], :name => 'articles_picture_id_index'
    add_index :articles, [:first_approved_date], :name => 'articles_first_approved_date_index'
    add_index :articles, [:major_modified_date], :name => 'articles_major_modified_date_index'
  end

  def self.down
    remove_column :articles, :picture_id
    remove_column :articles, :first_image_title
    remove_column :articles, :first_approved_date
    remove_column :articles, :major_modified_date
  end
end
