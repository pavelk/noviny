class CreateAuthors < ActiveRecord::Migration
  def self.up
    create_table :authors do |t|
      t.integer   :user_id
      t.string    :firstname,          :null => false, :default => ""
      t.string    :surname,            :null => false, :default => ""
      t.string    :email
      t.string    :nickname
      t.text      :cv
      t.timestamps
    end
    add_index :authors, [:user_id],   :name => 'authors_user_id_index'
  end

  def self.down
    drop_table :authors
  end
end
