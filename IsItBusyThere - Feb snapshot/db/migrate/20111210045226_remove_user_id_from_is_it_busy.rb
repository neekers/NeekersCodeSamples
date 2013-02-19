class RemoveUserIdFromIsItBusy < ActiveRecord::Migration
  def self.up
    remove_column :is_it_busies, :user_id
  end

  def self.down
    add_column :is_it_busies, :user_id, :integer
  end
end
