class AddVenueNameToIsItBusies < ActiveRecord::Migration
  def self.up
    add_column :is_it_busies, :venue_name, :string
  end

  def self.down
    remove_column :is_it_busies, :venue_name
  end
end
