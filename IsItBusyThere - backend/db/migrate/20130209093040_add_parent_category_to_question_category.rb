class AddParentCategoryToQuestionCategory < ActiveRecord::Migration
  def self.up
    add_column :question_categories, :parent_category_id, :string
  end

  def self.down
    remove_column :question_categories, :parent_category_id
  end
end
