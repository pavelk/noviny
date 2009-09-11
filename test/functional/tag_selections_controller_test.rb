require File.dirname(__FILE__) + '/../test_helper'
require 'tag_selections_controller'

# Re-raise errors caught by the controller.
class TagSelectionsController; def rescue_action(e) raise e end; end

class TagSelectionsControllerTest < Test::Unit::TestCase
  fixtures :tag_selections

  def setup
    @controller = TagSelectionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:tag_selections)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_tag_selection
    old_count = TagSelection.count
    post :create, :tag_selection => { }
    assert_equal old_count+1, TagSelection.count
    
    assert_redirected_to tag_selection_path(assigns(:tag_selection))
  end

  def test_should_show_tag_selection
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_tag_selection
    put :update, :id => 1, :tag_selection => { }
    assert_redirected_to tag_selection_path(assigns(:tag_selection))
  end
  
  def test_should_destroy_tag_selection
    old_count = TagSelection.count
    delete :destroy, :id => 1
    assert_equal old_count-1, TagSelection.count
    
    assert_redirected_to tag_selections_path
  end
end
