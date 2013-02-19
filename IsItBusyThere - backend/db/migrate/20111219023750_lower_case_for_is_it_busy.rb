class LowerCaseForIsItBusy < ActiveRecord::Migration
 def self.up
  rename_column :is_it_busies, 'IsItBusy', 'isitbusy'
  rename_column :is_it_busies, 'UserId','userid'
   rename_column :is_it_busies, 'Status','status'
   rename_column :is_it_busies, 'PlaceReference','placereference'
  #:tablenames, :fieldname, :string
  end

  def self.down
  rename_column :is_it_busies, 'isitbusy', 'IsItBusy'
    rename_column :is_it_busies, 'userid', 'UserId'
    rename_column :is_it_busies, 'status','Status'
   rename_column :is_it_busies, 'placereference','Placereference'
  end
end
