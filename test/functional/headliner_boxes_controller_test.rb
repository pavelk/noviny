require File.dirname(__FILE__) + '/../test_helper'
require 'headliner_boxes_controller'

# Re-raise errors caught by the controller.
class HeadlinerBoxesController; def rescue_action(e) raise e end; end

class HeadlinerBoxesControllerTest < Test::Unit::TestCase
  fixtures :headliner_boxes

  def setup
    @controller = HeadlinerBoxesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:headliner_boxes)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_headliner_box
    old_count = HeadlinerBox.count
    post :create, :headliner_box => { }
    assert_equal old_count+1, HeadlinerBox.count
    
    assert_redirected_to headliner_box_path(assigns(:headliner_box))
  end

  def test_should_show_headliner_box
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_headliner_box
    put :update, :id => 1, :headliner_box => { }
    assert_redirected_to headliner_box_path(assigns(:headliner_box))
  end
  
  def test_should_destroy_headliner_box
    old_count = HeadlinerBox.count
    delete :destroy, :id => 1
    assert_equal old_count-1, HeadlinerBox.count
    
    assert_redirected_to headliner_boxes_path
  end
end
