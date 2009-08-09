require File.dirname(__FILE__) + '/../test_helper'
require 'content_types_controller'

# Re-raise errors caught by the controller.
class ContentTypesController; def rescue_action(e) raise e end; end

class ContentTypesControllerTest < Test::Unit::TestCase
  fixtures :content_types

  def setup
    @controller = ContentTypesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:content_types)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_content_type
    old_count = ContentType.count
    post :create, :content_type => { }
    assert_equal old_count+1, ContentType.count
    
    assert_redirected_to content_type_path(assigns(:content_type))
  end

  def test_should_show_content_type
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_content_type
    put :update, :id => 1, :content_type => { }
    assert_redirected_to content_type_path(assigns(:content_type))
  end
  
  def test_should_destroy_content_type
    old_count = ContentType.count
    delete :destroy, :id => 1
    assert_equal old_count-1, ContentType.count
    
    assert_redirected_to content_types_path
  end
end
