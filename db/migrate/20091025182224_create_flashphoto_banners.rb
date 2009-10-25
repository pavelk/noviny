class CreateFlashphotoBanners < ActiveRecord::Migration
  def self.up
    create_table :flashphoto_banners do |t|
      t.integer "article_banner_id"
      t.timestamps
    end
    add_index :flashphoto_banners, [:article_banner_id],   :name => 'flashphoto_banners_article_banner_id_index'
  end

  def self.down
    drop_table :flashphoto_banners
  end
end