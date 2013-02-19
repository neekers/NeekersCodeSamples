class IsItBusiesUserId < ActiveRecord::Migration
  def self.up
    rename_column :is_it_busies, 'userid', 'user_id'
   end

   def self.down
     rename_column :is_it_busies, 'user_id', 'userid'
   end
 end
