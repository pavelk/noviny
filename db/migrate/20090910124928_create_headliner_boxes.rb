class CreateHeadlinerBoxes < ActiveRecord::Migration
  def self.up
    #Honzo indexuju jen ta pole, o kterych vim, ze je treba je indexovat. Pokud jsou pozadavky frontendu na dalsi indexace, nechavam na tobe.
    #Dalsi eventualni indexace udelej prosim jako specialni migracni file, at v tom neni bordel. 
    create_table :headliner_boxes, :force => true do |t|
      t.string :headline #nazev pro headline
      t.string :perex #perex pro headline
      t.date :publish_date #den, ktereho se headline tyka
      t.integer :picture_id #obrazek k headline, paruju s tab pictures jako belongs_to :picture
      t.integer :article_id #clanek, se kterym je provazany headline. mam jako join s Article, belongs_to :article
      t.string :picture_title #zde ma obrazek svuj specialni headlinovy popis, lisici se od nazvu Picture                              
      t.timestamps #klasicke updated_at a created_at
    end
    add_index :headliner_boxes, [:picture_id],   :name => 'headliner_boxes_picture_id_index'
    add_index :headliner_boxes, [:article_id],   :name => 'headliner_boxes_article_id_index'
    add_index :headliner_boxes, [:publish_date],   :name => 'headliner_boxes_publish_date_index'
  end

  def self.down
    drop_table :headliner_boxes
  end
end
