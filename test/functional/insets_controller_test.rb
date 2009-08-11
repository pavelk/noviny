require File.dirname(__FILE__) + '/../test_helper'
require 'insets_controller'

# Re-raise errors caught by the controller.
class InsetsController; def rescue_action(e) raise e end; end

class InsetsControllerTest < Test::Unit::TestCase
  fixtures :insets

  def setup
    @controller = InsetsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:insets)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_inset
    old_count = Inset.count
    post :create, :inset => { }
    assert_equal old_count+1, Inset.count
    
    assert_redirected_to inset_path(assigns(:inset))
  end

  def test_should_show_inset
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_inset
    put :update, :id => 1, :inset => { }
    assert_redirected_to inset_path(assigns(:inset))
  end
  
  def test_should_destroy_inset
    old_count = Inset.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Inset.count
    
    assert_redirected_to insets_path
  end
end
