class ConvertIntegertoBigInt < ActiveRecord::Migration
  def self.up
    change_column :is_it_busies, :UserId, :bigint
    change_column :is_it_busies, :PlaceId, :bigint
  end

  def self.down
    change_column :is_it_busies, :UserId, :integer
    change_column :is_it_busies, :PlaceId, :integer
  end
end
