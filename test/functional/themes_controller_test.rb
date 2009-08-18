require File.dirname(__FILE__) + '/../test_helper'
require 'themes_controller'

# Re-raise errors caught by the controller.
class ThemesController; def rescue_action(e) raise e end; end

class ThemesControllerTest < Test::Unit::TestCase
  fixtures :themes

  def setup
    @controller = ThemesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:themes)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_theme
    old_count = Theme.count
    post :create, :theme => { }
    assert_equal old_count+1, Theme.count
    
    assert_redirected_to theme_path(assigns(:theme))
  end

  def test_should_show_theme
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_theme
    put :update, :id => 1, :theme => { }
    assert_redirected_to theme_path(assigns(:theme))
  end
  
  def test_should_destroy_theme
    old_count = Theme.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Theme.count
    
    assert_redirected_to themes_path
  end
end
