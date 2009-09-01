class CreateRelationships < ActiveRecord::Migration
  def self.up
    create_table :relationships do |t|
      t.integer :article_id
      t.integer :relarticle_id
      t.timestamps
    end
    add_index :relationships, [:article_id],   :name => ':relationships_article_id_index'
    add_index :relationships, [:relarticle_id],   :name => ':relationships_relarticle_id_index'
  end

  def self.down
    drop_table :relationships
  end
end
