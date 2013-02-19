# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130209100013) do

  create_table "external_services", :force => true do |t|
    t.string   "ServiceName"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "foursquare_users", :force => true do |t|
    t.string   "foursquare_id"
    t.string   "access_token"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "foursquare_users", ["foursquare_id"], :name => "index_foursquare_users_on_foursquare_id"

  create_table "is_it_busies", :force => true do |t|
    t.integer  "user_id",        :limit => 8
    t.string   "placeid",        :limit => 500
    t.integer  "isitbusy"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "placereference", :limit => 500
    t.string   "venue_name"
    t.string   "icon_url"
  end

  create_table "is_it_busy_questions", :force => true do |t|
    t.integer  "is_it_busy_id"
    t.integer  "question_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "question_categories", :force => true do |t|
    t.integer  "question_id"
    t.string   "category_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "parent_category_id"
    t.string   "category_name"
    t.string   "parent_category_name"
  end

  create_table "questions", :force => true do |t|
    t.string   "question"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "status_responses", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.integer  "user_id",           :limit => 8
    t.integer  "externalserviceid"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "firstname"
    t.string   "lastname"
    t.string   "photo_url"
  end

end
