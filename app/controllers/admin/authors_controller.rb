class Admin::AuthorsController < Admin::AdminController
  
  create.before :set_user

  index.response do |wants|
    wants.js
  end

  show.response do |wants|
    wants.js
  end 

  new_action.response do |wants|
    wants.js
  end

  create.response do |wants|
    wants.js
  end

  edit.response do |wants|
    wants.js
  end

  update.response do |wants|
    wants.js
  end

  private

    def set_user
      @author.user_id = current_user.id
    end
end
