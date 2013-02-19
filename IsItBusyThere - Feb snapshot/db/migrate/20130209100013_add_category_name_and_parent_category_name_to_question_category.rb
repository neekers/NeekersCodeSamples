class AddCategoryNameAndParentCategoryNameToQuestionCategory < ActiveRecord::Migration
  def self.up
    add_column :question_categories, :category_name, :string
    add_column :question_categories, :parent_category_name, :string
  end

  def self.down
    remove_column :question_categories, :parent_category_name
    remove_column :question_categories, :category_name
  end
end
