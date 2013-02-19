class AddPlaceReferenceToIsItBusy < ActiveRecord::Migration
  def self.up
    add_column :is_it_busies, :PlaceReference, :string
  end

  def self.down
    remove_column :is_it_busies, :PlaceReference
  end
end
