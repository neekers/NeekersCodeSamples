class AlterColumnForIsItBusyBigInt < ActiveRecord::Migration
 def self.up
    change_table :users do |t|
      t.change :user_id, :bigint
    end
  end

  def self.down
    change_table :users do |t|
      t.change :user_id, :integer
    end
  end
end
