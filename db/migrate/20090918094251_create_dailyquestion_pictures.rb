class CreateDailyquestionPictures < ActiveRecord::Migration
  def self.up
    create_table :dailyquestion_pictures do |t|
      t.integer :picture_id, :dailyquestion_id
    end
    add_index :dailyquestion_pictures, [:picture_id],   :name => 'dailyquestion_pictures_picture_id_index'
    add_index :dailyquestion_pictures, [:dailyquestion_id], :name => 'dailyquestion_pictures_dailyquestion_id_index'
  end

  def self.down
    drop_table :dailyquestion_pictures
  end
end