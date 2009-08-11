# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090811125749) do

  create_table "albums", :force => true do |t|
    t.integer  "user_id"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "description"
    t.integer  "pictures_count", :default => 0
    t.string   "type"
    t.string   "album_type"
    t.integer  "insets_count",   :default => 0
    t.integer  "audios_count",   :default => 0
  end

  add_index "albums", ["lft", "rgt"], :name => "albums_lft_rgt_index"
  add_index "albums", ["parent_id"], :name => "albums_parent_id_index"
  add_index "albums", ["user_id"], :name => "albums_user_id_index"

  create_table "article_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "article_id"
  end

  add_index "article_pictures", ["article_id"], :name => "article_pictures_article_id_index"
  add_index "article_pictures", ["picture_id"], :name => "article_pictures_picture_id_index"

  create_table "articles", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.datetime "publish_date"
    t.text     "perex"
    t.text     "text"
    t.text     "poznamka"
    t.boolean  "approved"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "section_id"
    t.integer  "subsection_id"
    t.integer  "content_type_id"
    t.integer  "priority_home",    :default => 9999,  :null => false
    t.integer  "priority_section", :default => 9999,  :null => false
    t.boolean  "visibility",       :default => false, :null => false
  end

  add_index "articles", ["content_type_id"], :name => "articles_content_type_id_index"
  add_index "articles", ["priority_home"], :name => "articles_priority_home_index"
  add_index "articles", ["priority_section"], :name => "articles_priority_section_index"
  add_index "articles", ["section_id"], :name => "articles_section_id_index"
  add_index "articles", ["subsection_id"], :name => "articles_subsection_id_index"
  add_index "articles", ["user_id"], :name => "articles_user_id_index"

  create_table "audios", :force => true do |t|
    t.integer  "album_id"
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "data_file_name"
    t.string   "data_content_type"
    t.integer  "data_file_size"
  end

  add_index "audios", ["album_id"], :name => "audios_album_id_index"
  add_index "audios", ["user_id"], :name => "audios_user_id_index"

  create_table "author_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "author_id"
  end

  add_index "author_pictures", ["author_id"], :name => "author_pictures_author_id_index"
  add_index "author_pictures", ["picture_id"], :name => "author_pictures_picture_id_index"

  create_table "authors", :force => true do |t|
    t.integer  "user_id"
    t.string   "firstname",  :default => "", :null => false
    t.string   "surname",    :default => "", :null => false
    t.string   "email"
    t.string   "nickname"
    t.text     "cv"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "authors", ["user_id"], :name => "authors_user_id_index"

  create_table "content_types", :force => true do |t|
    t.string "name"
  end

  create_table "insets", :force => true do |t|
    t.integer  "album_id"
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "data_file_name"
    t.string   "data_content_type"
    t.integer  "data_file_size"
  end

  add_index "insets", ["album_id"], :name => "insets_album_id_index"
  add_index "insets", ["user_id"], :name => "insets_user_id_index"

  create_table "pictures", :force => true do |t|
    t.integer  "album_id"
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "data_file_name"
    t.string   "data_content_type"
    t.integer  "data_file_size"
    t.string   "data_width"
    t.string   "data_height"
  end

  add_index "pictures", ["album_id"], :name => "pictures_album_id_index"
  add_index "pictures", ["user_id"], :name => "pictures_user_id_index"

  create_table "sections", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
  end

  add_index "sections", ["lft", "rgt"], :name => "sections_lft_rgt_index"
  add_index "sections", ["parent_id"], :name => "sections_parent_id_index"

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :default => "", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "subsections", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "taggings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id"], :name => "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id", "taggable_type"], :name => "index_taggings_on_taggable_id_and_taggable_type"

  create_table "tags", :force => true do |t|
    t.string "name"
  end

  create_table "users", :force => true do |t|
    t.string   "user_name",           :default => "", :null => false
    t.string   "email",               :default => "", :null => false
    t.string   "crypted_password",    :default => "", :null => false
    t.string   "password_salt",       :default => "", :null => false
    t.string   "persistence_token",   :default => "", :null => false
    t.string   "single_access_token", :default => "", :null => false
    t.string   "perishable_token",    :default => "", :null => false
    t.integer  "login_count",         :default => 0,  :null => false
    t.integer  "failed_login_count",  :default => 0,  :null => false
    t.datetime "last_request_at"
    t.datetime "last_login_at"
    t.datetime "current_login_at"
    t.string   "current_login_ip"
    t.string   "last_login_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "login"
  end

  add_index "users", ["email"], :name => "index_users_on_email"
  add_index "users", ["last_request_at"], :name => "index_users_on_last_request_at"
  add_index "users", ["login"], :name => "index_users_on_login"
  add_index "users", ["perishable_token"], :name => "index_users_on_perishable_token"
  add_index "users", ["persistence_token"], :name => "index_users_on_persistence_token"

end
