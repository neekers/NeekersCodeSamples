class CreateFoursquareUsers < ActiveRecord::Migration
  def self.up
    create_table :foursquare_users do |t|
      t.string :foursquare_id
      t.string :access_token

      t.timestamps
    end
    add_index :foursquare_users, :foursquare_id
  end

  def self.down
    drop_table :foursquare_users
  end
end