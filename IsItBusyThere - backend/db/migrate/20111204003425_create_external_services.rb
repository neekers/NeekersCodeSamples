class CreateExternalServices < ActiveRecord::Migration
  def self.up
    create_table :external_services do |t|      
      t.string :ServiceName

      t.timestamps
    end
  end

  def self.down
    drop_table :external_services
  end
end
