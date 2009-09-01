require File.dirname(__FILE__) + '/../test_helper'
require 'info_boxes_controller'

# Re-raise errors caught by the controller.
class InfoBoxesController; def rescue_action(e) raise e end; end

class InfoBoxesControllerTest < Test::Unit::TestCase
  fixtures :info_boxes

  def setup
    @controller = InfoBoxesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:info_boxes)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_info_box
    old_count = InfoBox.count
    post :create, :info_box => { }
    assert_equal old_count+1, InfoBox.count
    
    assert_redirected_to info_box_path(assigns(:info_box))
  end

  def test_should_show_info_box
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_info_box
    put :update, :id => 1, :info_box => { }
    assert_redirected_to info_box_path(assigns(:info_box))
  end
  
  def test_should_destroy_info_box
    old_count = InfoBox.count
    delete :destroy, :id => 1
    assert_equal old_count-1, InfoBox.count
    
    assert_redirected_to info_boxes_path
  end
end
