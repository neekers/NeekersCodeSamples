class PlaceIdAsString < ActiveRecord::Migration
   def self.up
     rename_column :is_it_busies, 'PlaceId','placeid'
      change_table :is_it_busies do |t|
        t.change :placeid, :string
      end
    end

    def self.down
      rename_column :is_it_busies, 'placeid','PlaceId'
      change_table :is_it_busies do |t|
        t.change :placeid, :bigint
      end
    end
  end
