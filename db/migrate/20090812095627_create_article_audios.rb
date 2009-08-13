class CreateArticleAudios < ActiveRecord::Migration
  def self.up
    create_table :article_audios do |t|
      t.integer :audio_id, :article_id
    end
    add_index :article_audios, [:audio_id],   :name => 'article_audios_audio_id_index'
    add_index :article_audios, [:article_id], :name => 'article_audios_article_id_index'
  end

  def self.down
    drop_table :article_audios
  end
end