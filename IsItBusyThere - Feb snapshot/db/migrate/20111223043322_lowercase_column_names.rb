class LowercaseColumnNames < ActiveRecord::Migration
   def self.up
    rename_column :users, 'UserId', 'userid'
    rename_column :users, 'ExternalServiceId','externalserviceid'

    #:tablenames, :fieldname, :string
    end

    def self.down
      rename_column :users, 'userid', 'UserId'
      rename_column :users, 'externalserviceid','ExternalServiceId'
    end
end
