require File.dirname(__FILE__) + '/../test_helper'
require 'subsections_controller'

# Re-raise errors caught by the controller.
class SubsectionsController; def rescue_action(e) raise e end; end

class SubsectionsControllerTest < Test::Unit::TestCase
  fixtures :subsections

  def setup
    @controller = SubsectionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:subsections)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_subsection
    old_count = Subsection.count
    post :create, :subsection => { }
    assert_equal old_count+1, Subsection.count
    
    assert_redirected_to subsection_path(assigns(:subsection))
  end

  def test_should_show_subsection
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_subsection
    put :update, :id => 1, :subsection => { }
    assert_redirected_to subsection_path(assigns(:subsection))
  end
  
  def test_should_destroy_subsection
    old_count = Subsection.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Subsection.count
    
    assert_redirected_to subsections_path
  end
end
