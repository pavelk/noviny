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

ActiveRecord::Schema.define(:version => 20091025182736) do

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

  create_table "article_audios", :force => true do |t|
    t.integer "audio_id"
    t.integer "article_id"
  end

  add_index "article_audios", ["article_id"], :name => "article_audios_article_id_index"
  add_index "article_audios", ["audio_id"], :name => "article_audios_audio_id_index"

  create_table "article_banners", :force => true do |t|
    t.string   "headline"
    t.date     "publish_date"
    t.integer  "picture_id"
    t.integer  "article_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "article_banners", ["article_id"], :name => "article_banners_article_id_index"
  add_index "article_banners", ["picture_id"], :name => "article_banners_picture_id_index"
  add_index "article_banners", ["publish_date"], :name => "article_banners_publish_date_index"

  create_table "article_boxes", :force => true do |t|
    t.integer "article_id"
    t.integer "info_box_id"
  end

  add_index "article_boxes", ["article_id"], :name => "article_boxes_article_id_index"
  add_index "article_boxes", ["info_box_id"], :name => "article_boxes_info_box_id_index"

  create_table "article_comments", :force => true do |t|
    t.integer  "article_id"
    t.datetime "created_at"
    t.text     "text"
    t.integer  "web_user_id"
  end

  add_index "article_comments", ["article_id"], :name => "article_comments_article_id_index"
  add_index "article_comments", ["article_id"], :name => "index_article_comments_on_article_id"
  add_index "article_comments", ["web_user_id"], :name => "index_article_comments_on_web_user_id"

  create_table "article_insets", :force => true do |t|
    t.integer "inset_id"
    t.integer "article_id"
  end

  add_index "article_insets", ["article_id"], :name => "article_insets_article_id_index"
  add_index "article_insets", ["inset_id"], :name => "article_insets_inset_id_index"

  create_table "article_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "article_id"
  end

  add_index "article_pictures", ["article_id"], :name => "article_pictures_article_id_index"
  add_index "article_pictures", ["picture_id"], :name => "article_pictures_picture_id_index"

  create_table "article_sections", :force => true do |t|
    t.integer "article_id"
    t.integer "section_id"
  end

  add_index "article_sections", ["article_id"], :name => "article_sections_article_id_index"
  add_index "article_sections", ["section_id"], :name => "article_sections_section_id_index"

  create_table "article_selections", :force => true do |t|
    t.integer  "section_id"
    t.integer  "article_id"
    t.string   "sidebar_articles_ids"
    t.date     "publish_date"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "article_selections", ["section_id"], :name => "article_selections_section_id_index"

  create_table "article_themes", :force => true do |t|
    t.integer "article_id"
    t.integer "theme_id"
  end

  add_index "article_themes", ["article_id"], :name => "article_themes_article_id_index"
  add_index "article_themes", ["theme_id"], :name => "article_themes_theme_id_index"

  create_table "article_versions", :force => true do |t|
    t.integer  "article_id"
    t.integer  "version"
    t.integer  "author_id"
    t.string   "name"
    t.text     "perex"
    t.text     "text"
    t.text     "poznamka"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "article_versions", ["article_id"], :name => "article_versions_article_id_index"
  add_index "article_versions", ["author_id"], :name => "article_versions_author_id_index"
  add_index "article_versions", ["version"], :name => "article_versions_version_index"

  create_table "article_views", :force => true do |t|
    t.integer  "article_id"
    t.datetime "shown_date"
  end

  add_index "article_views", ["article_id"], :name => "article_views_article_id_index"

  create_table "articlebanner_sections", :force => true do |t|
    t.integer "article_banner_id"
    t.integer "section_id"
  end

  add_index "articlebanner_sections", ["article_banner_id"], :name => "articlebanner_sections_article_banner_id_index"
  add_index "articlebanner_sections", ["section_id"], :name => "articlebanner_sections_section_id_index"

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
    t.integer  "priority_home",    :default => 1,     :null => false
    t.integer  "priority_section", :default => 1,     :null => false
    t.boolean  "visibility",       :default => false, :null => false
    t.integer  "author_id"
    t.string   "videodata"
    t.integer  "version",          :default => 1
    t.datetime "order_date"
  end

  add_index "articles", ["author_id"], :name => "articles_author_id_on_index"
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

  create_table "author_insets", :force => true do |t|
    t.integer "inset_id"
    t.integer "author_id"
  end

  add_index "author_insets", ["author_id"], :name => "author_insets_author_id_index"
  add_index "author_insets", ["inset_id"], :name => "author_insets_inset_id_index"

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
    t.string   "linkedin"
    t.string   "twitter"
    t.string   "facebook"
    t.string   "phone"
  end

  add_index "authors", ["user_id"], :name => "authors_user_id_index"

  create_table "content_types", :force => true do |t|
    t.string "name"
  end

  create_table "dailyquestion_authors", :force => true do |t|
    t.integer "dailyquestion_id"
    t.integer "author_id"
    t.boolean "question_value"
    t.string  "question_text"
  end

  add_index "dailyquestion_authors", ["author_id"], :name => "dailyquestion_authors_author_id_index"
  add_index "dailyquestion_authors", ["dailyquestion_id"], :name => "dailyquestion_authors_dailyquestion_id_index"

  create_table "dailyquestion_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "dailyquestion_id"
  end

  add_index "dailyquestion_pictures", ["dailyquestion_id"], :name => "dailyquestion_pictures_dailyquestion_id_index"
  add_index "dailyquestion_pictures", ["picture_id"], :name => "dailyquestion_pictures_picture_id_index"

  create_table "dailyquestions", :force => true do |t|
    t.string   "headline"
    t.string   "question_text"
    t.text     "perex"
    t.date     "publish_date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "author_yes_id"
    t.integer  "author_no_id"
    t.string   "text_yes"
    t.string   "text_no"
  end

  add_index "dailyquestions", ["author_no_id"], :name => "dailyquestions_author_no_id_index"
  add_index "dailyquestions", ["author_yes_id"], :name => "dailyquestions_author_yes_id_index"

  create_table "flashphoto_banners", :force => true do |t|
    t.integer  "article_banner_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  add_index "flashphoto_banners", ["article_banner_id"], :name => "flashphoto_banners_article_banner_id_index"

  create_table "flashphoto_headliners", :force => true do |t|
    t.integer  "headliner_box_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  add_index "flashphoto_headliners", ["headliner_box_id"], :name => "flashphoto_headliners_headliner_box_id_index"

  create_table "headliner_articles", :force => true do |t|
    t.integer "headliner_box_id"
    t.integer "article_id"
  end

  add_index "headliner_articles", ["article_id"], :name => "headliner_articles_article_id_index"
  add_index "headliner_articles", ["headliner_box_id"], :name => "headliner_articles_headliner_box_id_index"

  create_table "headliner_boxes", :force => true do |t|
    t.string   "headline"
    t.string   "perex"
    t.date     "publish_date"
    t.integer  "picture_id"
    t.integer  "article_id"
    t.string   "picture_title"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "headliner_boxes", ["article_id"], :name => "headliner_boxes_article_id_index"
  add_index "headliner_boxes", ["picture_id"], :name => "headliner_boxes_picture_id_index"
  add_index "headliner_boxes", ["publish_date"], :name => "headliner_boxes_publish_date_index"

  create_table "headliner_sections", :force => true do |t|
    t.integer "headliner_box_id"
    t.integer "section_id"
  end

  add_index "headliner_sections", ["headliner_box_id"], :name => "headliner_sections_headliner_box_id_index"
  add_index "headliner_sections", ["section_id"], :name => "headliner_sections_section_id_index"

  create_table "headliner_themes", :force => true do |t|
    t.integer "headliner_box_id"
    t.integer "theme_id"
  end

  add_index "headliner_themes", ["headliner_box_id"], :name => "headliner_themes_headliner_box_id_index"
  add_index "headliner_themes", ["theme_id"], :name => "headliner_themes_theme_id_index"

  create_table "info_box_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "info_box_id"
  end

  add_index "info_box_pictures", ["info_box_id"], :name => "info_box_id_pictures_info_box_id_id_index"
  add_index "info_box_pictures", ["picture_id"], :name => "info_box_pictures_picture_id_index"

  create_table "info_boxes", :force => true do |t|
    t.integer  "user_id"
    t.integer  "author_id"
    t.string   "title"
    t.string   "name"
    t.text     "text"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "info_boxes", ["user_id"], :name => "info_boxes_author_id_index"
  add_index "info_boxes", ["user_id"], :name => "info_boxes_user_id_index"

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

  create_table "logged_exceptions", :force => true do |t|
    t.string   "exception_class"
    t.string   "controller_name"
    t.string   "action_name"
    t.text     "message"
    t.text     "backtrace"
    t.text     "environment"
    t.text     "request"
    t.datetime "created_at"
  end

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
    t.string   "author"
    t.string   "type_image"
  end

  add_index "pictures", ["album_id"], :name => "pictures_album_id_index"
  add_index "pictures", ["user_id"], :name => "pictures_user_id_index"

  create_table "question_votes", :force => true do |t|
    t.integer  "question_id"
    t.integer  "web_user_id"
    t.boolean  "vote_value"
    t.datetime "created_at"
    t.string   "ipaddr",      :limit => 15
  end

  add_index "question_votes", ["created_at"], :name => "question_votes_created_at_index"
  add_index "question_votes", ["ipaddr"], :name => "index_question_votes_on_ipaddr"
  add_index "question_votes", ["question_id"], :name => "question_votes_question_id_index"
  add_index "question_votes", ["vote_value"], :name => "question_votes_vote_value_index"
  add_index "question_votes", ["web_user_id"], :name => "question_votes_user_id_index"

  create_table "relationships", :force => true do |t|
    t.integer  "article_id"
    t.integer  "relarticle_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "relationships", ["article_id"], :name => ":relationships_article_id_index"
  add_index "relationships", ["relarticle_id"], :name => ":relationships_relarticle_id_index"

  create_table "relationthemeships", :force => true do |t|
    t.integer  "theme_id"
    t.integer  "reltheme_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "relationthemeships", ["reltheme_id"], :name => ":relationthemeships_reltheme_id_index"
  add_index "relationthemeships", ["theme_id"], :name => ":relationthemeships_theme_id_index"

  create_table "sections", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.integer  "user_id"
    t.integer  "author_id"
    t.text     "description"
    t.integer  "position"
  end

  add_index "sections", ["author_id"], :name => "sections_author_id_index"
  add_index "sections", ["lft", "rgt"], :name => "sections_lft_rgt_index"
  add_index "sections", ["parent_id"], :name => "sections_parent_id_index"
  add_index "sections", ["user_id"], :name => "sections_user_id_index"

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
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

  create_table "tag_selections", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "headline"
    t.date     "publish_date"
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
    t.string   "name"
    t.integer  "user_id"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tags", ["user_id"], :name => "tags_user_id_index"

  create_table "text_page_insets", :force => true do |t|
    t.integer "inset_id"
    t.integer "text_page_id"
  end

  add_index "text_page_insets", ["inset_id"], :name => "text_page_insets_inset_id_index"
  add_index "text_page_insets", ["text_page_id"], :name => "text_page_insets_text_page_id_index"

  create_table "text_page_pictures", :force => true do |t|
    t.integer "picture_id"
    t.integer "text_page_id"
  end

  add_index "text_page_pictures", ["picture_id"], :name => "text_page_pictures_picture_id_index"
  add_index "text_page_pictures", ["text_page_id"], :name => "text_page_pictures_text_page_id_index"

  create_table "text_pages", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.string   "title"
    t.text     "perex"
    t.text     "text"
    t.boolean  "approved"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "text_pages", ["user_id"], :name => "text_pages_user_id_index"

  create_table "themeselection_sections", :force => true do |t|
    t.integer "tag_selection_id"
    t.integer "section_id"
  end

  add_index "themeselection_sections", ["section_id"], :name => "themeselection_sections_section_id_index"
  add_index "themeselection_sections", ["tag_selection_id"], :name => "themeselection_sections_tag_selection_id_index"

  create_table "themeselection_themes", :force => true do |t|
    t.integer "tag_selection_id"
    t.integer "theme_id"
  end

  add_index "themeselection_themes", ["tag_selection_id"], :name => "themeselection_themes_tag_selection_id_index"
  add_index "themeselection_themes", ["theme_id"], :name => "themeselection_themes_theme_id_index"

  create_table "users", :force => true do |t|
    t.string   "user_name",           :default => "", :null => false
    t.string   "email",                               :null => false
    t.string   "crypted_password",                    :null => false
    t.string   "password_salt",                       :null => false
    t.string   "persistence_token",                   :null => false
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

  create_table "web_user_payments", :force => true do |t|
    t.datetime "created_at"
    t.date     "payed_at"
    t.integer  "web_user_id"
    t.decimal  "price",       :precision => 10, :scale => 2
  end

  create_table "web_users", :force => true do |t|
    t.string   "login",              :limit => 40,                     :null => false
    t.string   "cryptpassword",      :limit => 40,                     :null => false
    t.string   "validkey",           :limit => 40
    t.string   "email",              :limit => 100,                    :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "confirmed",                         :default => false
    t.text     "domains",                                              :null => false
    t.string   "firstname"
    t.string   "lastname"
    t.string   "street"
    t.string   "city"
    t.string   "number"
    t.string   "psc"
    t.string   "profession"
    t.string   "phone"
    t.string   "title"
    t.boolean  "send_reports",                      :default => false
    t.boolean  "payed",                             :default => false
    t.integer  "author_id"
    t.date     "expire_date"
    t.date     "born_date"
    t.string   "web"
    t.string   "skype"
    t.string   "twitter"
    t.boolean  "show_mail",                         :default => false
    t.boolean  "show_phone",                        :default => false
    t.boolean  "show_address",                      :default => false
    t.boolean  "show_web",                          :default => false
    t.boolean  "show_skype",                        :default => false
    t.boolean  "show_twitter",                      :default => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
  end

end
