class AddIconUrlToIsItBusies < ActiveRecord::Migration
  def self.up
    add_column :is_it_busies, :icon_url, :string
  end

  def self.down
    remove_column :is_it_busies, :icon_url
  end
end
