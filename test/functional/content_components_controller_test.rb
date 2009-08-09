require File.dirname(__FILE__) + '/../test_helper'
require 'content_components_controller'

# Re-raise errors caught by the controller.
class ContentComponentsController; def rescue_action(e) raise e end; end

class ContentComponentsControllerTest < Test::Unit::TestCase
  fixtures :content_components

  def setup
    @controller = ContentComponentsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:content_components)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_content_component
    old_count = ContentComponent.count
    post :create, :content_component => { }
    assert_equal old_count+1, ContentComponent.count
    
    assert_redirected_to content_component_path(assigns(:content_component))
  end

  def test_should_show_content_component
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_content_component
    put :update, :id => 1, :content_component => { }
    assert_redirected_to content_component_path(assigns(:content_component))
  end
  
  def test_should_destroy_content_component
    old_count = ContentComponent.count
    delete :destroy, :id => 1
    assert_equal old_count-1, ContentComponent.count
    
    assert_redirected_to content_components_path
  end
end
