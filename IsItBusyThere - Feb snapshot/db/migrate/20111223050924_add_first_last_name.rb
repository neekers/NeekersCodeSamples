class AddFirstLastName < ActiveRecord::Migration
  def self.up
    add_column :is_it_busies, :firstname, :string
    add_column :is_it_busies, :lastname, :string
  end

  def self.down
    remove_column :is_it_busies, :lastname
    remove_column :is_it_busies, :firstname
  end
end
