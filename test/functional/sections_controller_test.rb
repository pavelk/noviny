require File.dirname(__FILE__) + '/../test_helper'
require 'sections_controller'

# Re-raise errors caught by the controller.
class SectionsController; def rescue_action(e) raise e end; end

class SectionsControllerTest < Test::Unit::TestCase
  fixtures :sections

  def setup
    @controller = SectionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:sections)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_section
    old_count = Section.count
    post :create, :section => { }
    assert_equal old_count+1, Section.count
    
    assert_redirected_to section_path(assigns(:section))
  end

  def test_should_show_section
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_section
    put :update, :id => 1, :section => { }
    assert_redirected_to section_path(assigns(:section))
  end
  
  def test_should_destroy_section
    old_count = Section.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Section.count
    
    assert_redirected_to sections_path
  end
end
