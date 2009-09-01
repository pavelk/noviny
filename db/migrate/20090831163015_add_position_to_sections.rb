#Added by Jan Uhlar
#For dynamic menu
class AddPositionToSections < ActiveRecord::Migration
  def self.up
    add_column :sections, :position, :integer
  end

  def self.down
    remove_column :sections, :position
  end
end
