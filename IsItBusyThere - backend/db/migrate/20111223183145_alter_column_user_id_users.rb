class AlterColumnUserIdUsers < ActiveRecord::Migration
  def self.up
    change_table :users do |t|
      t.bigint :user_id
    end
    #execute "ALTER TABLE users ADD primary key (user_id)"
   end

   def self.down
   
   end
end
