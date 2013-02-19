class CreateIsItBusies < ActiveRecord::Migration
  def self.up
    create_table :is_it_busies do |t|      
      t.integer :UserId
      t.integer :PlaceId
      t.integer :IsItBusy
      t.string :Status
      t.references :user

      t.timestamps
    end 
  end

  def self.down
    drop_table :is_it_busies
  end
end
