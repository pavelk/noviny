class CreateFlashphotoHeadliners < ActiveRecord::Migration
  def self.up
    create_table :flashphoto_headliners do |t|
      t.integer   "headliner_box_id"
      t.timestamps
    end
    add_index :flashphoto_headliners, [:headliner_box_id],   :name => 'flashphoto_headliners_headliner_box_id_index'
  end

  def self.down
    drop_table :flashphoto_headliners
  end
end
