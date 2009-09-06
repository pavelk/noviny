require File.dirname(__FILE__) + '/../test_helper'
require 'article_selections_controller'

# Re-raise errors caught by the controller.
class ArticleSelectionsController; def rescue_action(e) raise e end; end

class ArticleSelectionsControllerTest < Test::Unit::TestCase
  fixtures :article_selections

  def setup
    @controller = ArticleSelectionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:article_selections)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_article_selection
    old_count = ArticleSelection.count
    post :create, :article_selection => { }
    assert_equal old_count+1, ArticleSelection.count
    
    assert_redirected_to article_selection_path(assigns(:article_selection))
  end

  def test_should_show_article_selection
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_article_selection
    put :update, :id => 1, :article_selection => { }
    assert_redirected_to article_selection_path(assigns(:article_selection))
  end
  
  def test_should_destroy_article_selection
    old_count = ArticleSelection.count
    delete :destroy, :id => 1
    assert_equal old_count-1, ArticleSelection.count
    
    assert_redirected_to article_selections_path
  end
end
