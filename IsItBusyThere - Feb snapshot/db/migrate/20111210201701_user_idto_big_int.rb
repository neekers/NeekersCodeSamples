class UserIdtoBigInt < ActiveRecord::Migration
 def self.up
    change_table :is_it_busies do |t|
      t.change :UserId, :bigint
    end
  end

  def self.down
    change_table :is_it_busies do |t|      
      t.change :UserId, :integer
    end
  end
end
