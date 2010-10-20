class AddDailyquestionIdToArticleBanners < ActiveRecord::Migration
  def self.up
    add_column :article_banners, :dailyquestion_id, :integer
  end

  def self.down
    remove_column :article_banners, :dailyquestion_id
  end
end
