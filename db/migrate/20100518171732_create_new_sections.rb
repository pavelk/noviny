class CreateNewSections < ActiveRecord::Migration
  def self.up
    Section.create(:name=>"Váš Hlas") unless Section.find_by_name("Váš Hlas")
    Section.create(:name=>"Fórum") unless Section.find_by_name("Fórum")
  end

  def self.down
  end
end
